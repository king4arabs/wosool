<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;
use App\Models\EcosystemRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EcosystemController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['search' => 'nullable|string|max:150', 'entity_type' => 'nullable|in:organization,program,opportunity',
            'category' => 'nullable|string|max:80', 'application_status' => 'nullable|in:open,closed,not_announced']);
        $query = EcosystemRecord::published();
        foreach (['entity_type', 'category'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->input($field));
            }
        }
        if ($request->input('application_status') === 'open') {
            $query->where('application_status', 'open')->where('verification_status', 'verified')->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', now('Asia/Riyadh')->toDateString()));
        } elseif ($request->input('application_status') === 'closed') {
            $query->where(fn ($q) => $q->where('application_status', 'closed')->orWhereDate('deadline', '<', now('Asia/Riyadh')->toDateString()));
        } elseif ($request->filled('application_status')) {
            $query->where('application_status', 'not_announced');
        }
        if ($request->filled('search')) {
            $search = str_replace(['%', '_'], ['\\%', '\\_'], $request->input('search'));
            $query->where(fn ($q) => $q->where('name_ar', 'like', "%$search%")->orWhere('name_en', 'like', "%$search%")->orWhere('description_en', 'like', "%$search%")->orWhere('description_ar', 'like', "%$search%"));
        }
        $rows = $query->orderBy('name_en')->paginate(24);
        $rows->through(fn ($row) => $this->present($row));

        return response()->json($rows);
    }

    public function show(string $slug)
    {
        return response()->json(['data' => $this->present(EcosystemRecord::published()->where('slug', $slug)->firstOrFail())]);
    }

    public function adminIndex()
    {
        return response()->json(['data' => EcosystemRecord::orderBy('name_en')->get()]);
    }

    public function review(Request $request, EcosystemRecord $record)
    {
        $data = $request->validate(['verification_status' => 'required|in:verified,needs_review,expired,archived', 'note' => 'required|string|max:2000',
            'application_status' => 'sometimes|required|in:open,closed,not_announced', 'deadline' => 'sometimes|nullable|date',
            'name_ar' => 'sometimes|required|string|max:255', 'name_en' => 'sometimes|required|string|max:255',
            'description_ar' => 'sometimes|required|string|max:4000', 'description_en' => 'sometimes|required|string|max:4000',
            'website_url' => 'sometimes|required|url:https|max:2048', 'application_url' => 'sometimes|nullable|url:https|max:2048',
            'source_urls' => 'sometimes|required|array|min:1|max:15', 'source_urls.*' => 'required|url:https|max:2048',
            'verified_at' => 'sometimes|required|date|before_or_equal:today', 'updated_at' => 'required|string']);
        DB::transaction(function () use ($request, $record, $data) {
            $row = EcosystemRecord::whereKey($record->id)->lockForUpdate()->firstOrFail();
            abort_unless($row->updated_at->toJSON() === $data['updated_at'], 409, 'The record changed. Refresh first.');
            $before = $row->toArray();
            $row->fill(collect($data)->except(['note', 'updated_at'])->all());
            $row->editorial_lock = true;
            $row->save();
            DB::table('ecosystem_revisions')->insert(['ecosystem_record_id' => $row->id, 'actor_id' => $request->user()->id,
                'action' => 'reviewed', 'before_state' => json_encode($before), 'after_state' => json_encode($row->toArray()), 'note' => $data['note'], 'created_at' => now()]);
        });

        return response()->json(['data' => $record->fresh()]);
    }

    private function present(EcosystemRecord $record): array
    {
        $data = $record->toArray();
        unset($data['editorial_lock']);
        if ($record->deadline && $record->deadline->toDateString() < now('Asia/Riyadh')->toDateString()) {
            $data['application_status'] = 'closed';
            if ($record->entity_type === 'opportunity') {
                $data['verification_status'] = 'expired';
            }
        }

        return $data;
    }
}
