<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Eoa\ApplicationRequest;
use App\Models\ProgramApplication;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public static function present(ProgramApplication $application): array
    {
        return [
            'id' => $application->id, 'status' => $application->status,
            'version' => $application->eoa_version, 'fields' => $application->eoa_data ?? [],
            'submitted_at' => $application->eoa_submitted_at?->toIso8601String(),
            'updated_at' => $application->updated_at?->toIso8601String(),
            'decision_reason' => $application->decision_reason,
            'documents' => DB::table('eoa_documents')->where('application_id', $application->id)->get(['id', 'name', 'size', 'created_at']),
        ];
    }

    public function show(Request $request)
    {
        $program = ProgramService::program();
        $application = $program->applications()->where('user_id', $request->user()->id)->first();

        return response()->json(['data' => $application ? self::present($application) : null]);
    }

    public function save(ApplicationRequest $request)
    {
        abort_unless(ProgramService::collectionReady(), 503, 'Application data collection awaits approval of the local data notice / جمع بيانات الطلب بانتظار اعتماد إشعار البيانات المحلي.');
        $program = ProgramService::program();

        return DB::transaction(function () use ($request, $program) {
            // Serialize initial creation as well as later draft updates for this account.
            DB::table('users')->where('id', $request->user()->id)->lockForUpdate()->first();
            $application = $program->applications()->where('user_id', $request->user()->id)->lockForUpdate()->first();
            if (! $application) {
                $application = $program->applications()->create(['user_id' => $request->user()->id, 'motivation' => '', 'status' => 'draft', 'eoa_version' => 0]);
            }
            abort_unless(in_array($application->status, ['draft', 'information_requested'], true), 409, 'This application is locked for review.');
            abort_unless($application->eoa_version === $request->integer('version'), 409, 'A newer draft exists. Reload before saving.');
            $fields = $request->safe()->except('version');
            $application->update(['eoa_data' => $fields, 'eoa_version' => $application->eoa_version + 1]);

            return response()->json(['data' => self::present($application)]);
        });
    }

    public function submit(Request $request)
    {
        abort_unless(ProgramService::collectionReady(), 503, 'Application data collection awaits approval of the local data notice / جمع بيانات الطلب بانتظار اعتماد إشعار البيانات المحلي.');
        $request->validate(['version' => 'required|integer|min:1']);
        $program = ProgramService::program();
        abort_unless($program->is_open && ProgramService::settings($program)['approval_status'] === 'approved', 409, 'Local applications have not opened. Your draft is saved.');
        abort_if($program->application_deadline?->isPast(), 409, 'The application deadline has passed.');

        return DB::transaction(function () use ($request, $program) {
            $application = $program->applications()->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($application->status, ['draft', 'information_requested'], true), 409, 'Already submitted.');
            abort_unless($request->integer('version') === $application->eoa_version, 409, 'A newer draft exists. Reload before submitting.');
            Validator::make($application->eoa_data ?? [], ApplicationRequest::fields(true))->validate();
            abort_unless(DB::table('eoa_documents')->where('application_id', $application->id)->exists(), 422, 'Upload supporting revenue evidence before submitting.');
            $application->update(['status' => 'submitted', 'eoa_submitted_at' => $application->eoa_submitted_at ?? now(), 'eoa_data' => array_merge($application->eoa_data, ['consented_at' => now()->toIso8601String(), 'privacy_notice_version' => ProgramService::settings($program)['privacy_notice_version']]), 'eoa_version' => $application->eoa_version + 1]);
            ProgramService::notify($request->user(), 'submitted', 'Application received / تم استلام طلبك. Follow its progress in your account.');

            return response()->json(['data' => self::present($application), 'email_queued' => ProgramService::mailConfigured()]);
        });
    }

    public function upload(Request $request)
    {
        abort_unless(ProgramService::collectionReady(), 503, 'Application data collection awaits approval of the local data notice / جمع بيانات الطلب بانتظار اعتماد إشعار البيانات المحلي.');
        $request->validate(['document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240']);

        return DB::transaction(function () use ($request) {
            $application = ProgramService::program()->applications()->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($application->status, ['draft', 'information_requested'], true), 409);
            abort_if(DB::table('eoa_documents')->where('application_id', $application->id)->count() >= 5, 422, 'Maximum five documents.');
            $file = $request->file('document');
            $path = $file->store('eoa/'.$application->id, 'local');
            abort_unless($path, 503, 'Document could not be stored. Please retry.');
            try {
                DB::table('eoa_documents')->insert([
                    'application_id' => $application->id, 'path' => $path,
                    'name' => 'evidence-'.substr(hash('sha256', $path), 0, 10).'.'.$file->extension(),
                    'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'created_at' => now(), 'updated_at' => now(),
                ]);
            } catch (\Throwable $error) {
                Storage::disk('local')->delete($path);
                throw $error;
            }

            return response()->json(['data' => self::present($application)], 201);
        });
    }

    public function download(Request $request, int $document)
    {
        $row = DB::table('eoa_documents')->where('id', $document)->first();
        abort_unless($row, 404);
        $application = ProgramService::program()->applications()->findOrFail($row->application_id);
        abort_unless($application->user_id === $request->user()->id || Access::application($request->user(), $application), 403);
        abort_unless(Storage::disk('local')->exists($row->path), 404);

        return Storage::disk('local')->download($row->path, $row->name, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function removeDocument(Request $request, int $document)
    {
        return DB::transaction(function () use ($request, $document) {
            $application = ProgramService::program()->applications()->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($application->status, ['draft', 'information_requested'], true), 409);
            $row = DB::table('eoa_documents')->where('application_id', $application->id)->where('id', $document)->first();
            abort_unless($row, 404);
            Storage::disk('local')->delete($row->path);
            DB::table('eoa_documents')->where('id', $row->id)->delete();

            return response()->noContent();
        });
    }
}
