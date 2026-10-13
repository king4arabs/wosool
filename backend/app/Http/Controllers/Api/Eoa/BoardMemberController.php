<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\EoaBoardMember;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BoardMemberController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(Access::staff($request->user()), 403);

        return response()->json(['data' => EoaBoardMember::where('program_id', ProgramService::program()->id)
            ->orderBy('display_order')->orderBy('id')->get()]);
    }

    public function store(Request $request)
    {
        abort_unless(Access::staff($request->user()), 403);
        $program = ProgramService::program();
        $data = $this->validated($request, $program->id);
        abort_if(($data['publication_status'] ?? 'draft') === 'published' && ! Access::lead($request->user()), 403);
        $this->validatePublication($data);

        return DB::transaction(function () use ($request, $program, $data) {
            $member = EoaBoardMember::create($data + ['program_id' => $program->id]);
            AdminAction::log($request->user()->id, 'eoa.board_created', 'eoa_board_member', $member->id, null, null, $member->toArray());

            return response()->json(['data' => $member->fresh()], 201);
        });
    }

    public function update(Request $request, int $member)
    {
        abort_unless(Access::staff($request->user()), 403);
        $program = ProgramService::program();

        return DB::transaction(function () use ($request, $program, $member) {
            $row = EoaBoardMember::where('program_id', $program->id)->lockForUpdate()->findOrFail($member);
            $this->authorizeEdit($request, $row);
            $data = $this->validated($request, $program->id, $row->id);
            abort_unless((int) $data['version'] === $row->version, 409, 'This board member changed. Reload the list and select the member again before saving.');
            abort_if(($data['publication_status'] ?? $row->publication_status) === 'published' && ! Access::lead($request->user()), 403);
            $this->validatePublication(array_replace($row->toArray(), $data));
            $before = $row->toArray();
            $row->update(array_replace($data, ['version' => $row->version + 1]));
            AdminAction::log($request->user()->id, 'eoa.board_updated', 'eoa_board_member', $row->id, null, $before, $row->fresh()->toArray());

            return response()->json(['data' => $row->fresh()]);
        });
    }

    public function portrait(Request $request, int $member)
    {
        abort_unless(Access::staff($request->user()), 403);
        $data = $request->validate([
            'version' => 'required|integer|min:1',
            'portrait' => 'required|file|image|mimes:jpg,jpeg,png,webp|mimetypes:image/jpeg,image/png,image/webp|max:2048|dimensions:min_width=160,min_height=160,max_width=6000,max_height=6000',
        ]);
        $program = ProgramService::program();
        $storedPath = null;
        try {
            return DB::transaction(function () use ($request, $program, $member, $data, &$storedPath) {
                $row = EoaBoardMember::where('program_id', $program->id)->lockForUpdate()->findOrFail($member);
                $this->authorizeEdit($request, $row);
                abort_unless((int) $data['version'] === $row->version, 409, 'This board member changed. Reload the list and select the member again before uploading.');
                $file = $request->file('portrait');
                $extension = match ($file->getMimeType()) {
                    'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
                    default => abort(422, 'Choose a JPEG, PNG or WebP portrait.'),
                };
                $storedPath = Storage::disk('public')->putFileAs('eoa/board', $file, Str::uuid().'.'.$extension);
                abort_unless($storedPath, 500, 'The portrait could not be saved. Please try again.');
                $before = ['portrait_path' => $row->portrait_path, 'version' => $row->version];
                $row->update(['portrait_path' => '/storage/'.$storedPath, 'version' => $row->version + 1]);
                AdminAction::log($request->user()->id, 'eoa.board_portrait_updated', 'eoa_board_member', $row->id, null, $before, ['portrait_path' => $row->portrait_path, 'version' => $row->version]);

                return response()->json(['data' => $row->fresh()]);
            });
        } catch (\Throwable $error) {
            if ($storedPath) Storage::disk('public')->delete($storedPath);
            throw $error;
        }
    }

    private function authorizeEdit(Request $request, EoaBoardMember $member): void
    {
        // Editing visible content is itself a publishing action.
        abort_if($member->publication_status === 'published' && ! Access::lead($request->user()), 403);
    }

    private function validatePublication(array $data): void
    {
        if (($data['publication_status'] ?? 'draft') !== 'published') return;

        Validator::make($data, [
            'name_en' => 'required|string',
            'position_en' => 'required|string',
            'board_term' => 'required|string',
            'portrait_path' => 'required|string',
        ], ['portrait_path.required' => 'Add a portrait before publishing this board member.'])->validate();
    }

    private function validated(Request $request, int $programId, ?int $member = null): array
    {
        $required = $member ? 'sometimes|required' : 'required';
        $rules = [
            'slug' => [$member ? 'sometimes' : 'required', 'required', 'string', 'max:160', 'regex:/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/', Rule::unique('eoa_board_members')->where('program_id', $programId)->ignore($member)],
            'name_en' => $required.'|string|max:255', 'name_ar' => 'nullable|string|max:255',
            'position_en' => $required.'|string|max:255', 'position_ar' => 'nullable|string|max:255',
            'company_name_en' => 'nullable|string|max:255', 'company_name_ar' => 'nullable|string|max:255',
            'company_role_en' => 'nullable|string|max:255', 'company_role_ar' => 'nullable|string|max:255',
            'portrait_path' => ['nullable', 'string', 'max:500', 'regex:~\A/(?:eoa/board|storage/eoa/board)/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)\z~'],
            'portrait_alt_en' => 'nullable|string|max:255', 'portrait_alt_ar' => 'nullable|string|max:255',
            'portrait_position' => ['sometimes', 'required', 'string', 'regex:/\A(?:100|[0-9]{1,2}(?:\.[0-9])?)% (?:100|[0-9]{1,2}(?:\.[0-9])?)%\z/'],
            'display_order' => 'sometimes|required|integer|min:0|max:10000',
            'board_term' => $required.'|string|max:40',
            'is_active' => 'sometimes|required|boolean',
            'publication_status' => 'sometimes|required|in:draft,published',
            'source_references' => 'nullable|array|max:30',
            'source_references.*' => 'required|array:label,url,note',
            'source_references.*.label' => 'required|string|max:255',
            'source_references.*.url' => ['nullable', 'string', 'max:2048', 'url:http,https', $this->webUrl()],
            'source_references.*.note' => 'nullable|string|max:2000',
            'verified_at' => 'nullable|date_format:Y-m-d|before_or_equal:today',
        ];
        if ($member) $rules['version'] = 'required|integer|min:1';
        foreach (['company', 'linkedin', 'twitter', 'facebook', 'instagram'] as $platform) {
            $rules[$platform.'_url'] = ['nullable', 'string', 'max:2048', 'url:http,https', $this->webUrl($platform === 'company' ? null : $platform)];
        }

        return $request->validate($rules);
    }

    private function webUrl(?string $platform = null): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($platform) {
            $parts = parse_url($value);
            if (! $parts || isset($parts['user']) || isset($parts['pass']) || preg_match('/[\x00-\x20\\\\]/', $value)) {
                $fail('Use a valid HTTP or HTTPS web address without login credentials.');
                return;
            }
            if (! $platform) return;
            $hosts = match ($platform) {
                'linkedin' => ['linkedin.com', 'www.linkedin.com'],
                'twitter' => ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
                'facebook' => ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
                'instagram' => ['instagram.com', 'www.instagram.com'],
            };
            if (! in_array(strtolower($parts['host'] ?? ''), $hosts, true) || empty(trim($parts['path'] ?? '', '/'))) {
                $fail('Use a direct profile link on '.$platform.'.');
            }
        };
    }
}
