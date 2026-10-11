<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\EoaMentorProfile;
use App\Models\User;
use App\Services\Eoa\Access;
use App\Services\Eoa\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MentorProfileController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(Access::staff($request->user()), 403);

        return response()->json(['data' => EoaMentorProfile::where('program_id', ProgramService::program()->id)
            ->orderBy('display_order')->orderBy('id')->get()]);
    }

    public function store(Request $request)
    {
        abort_unless(Access::staff($request->user()), 403);
        $program = ProgramService::program();
        $data = $this->validated($request, $program->id);
        $this->authorizeChanges($request, $data);
        $this->validatePublication($data);

        return DB::transaction(function () use ($request, $program, $data) {
            $profile = EoaMentorProfile::create($data + ['program_id' => $program->id]);
            AdminAction::log($request->user()->id, 'eoa.mentor_created', 'eoa_mentor_profile', $profile->id, null, null, $profile->toArray());

            return response()->json(['data' => $profile->fresh()], 201);
        });
    }

    public function update(Request $request, int $mentor)
    {
        abort_unless(Access::staff($request->user()), 403);
        $program = ProgramService::program();

        return DB::transaction(function () use ($request, $program, $mentor) {
            $profile = EoaMentorProfile::where('program_id', $program->id)->lockForUpdate()->findOrFail($mentor);
            $this->authorizeEdit($request, $profile);
            $data = $this->validated($request, $program->id, $profile->id);
            abort_unless($data['version'] === $profile->version, 409, 'This mentor profile changed. Reload it before saving.');
            $this->authorizeChanges($request, $data, $profile);
            $this->validatePublication(array_replace($profile->toArray(), $data));
            $before = $profile->toArray();
            $profile->update(array_replace($data, ['version' => $profile->version + 1]));
            AdminAction::log($request->user()->id, 'eoa.mentor_updated', 'eoa_mentor_profile', $profile->id, null, $before, $profile->fresh()->toArray());

            return response()->json(['data' => $profile->fresh()]);
        });
    }

    public function portrait(Request $request, int $mentor)
    {
        abort_unless(Access::staff($request->user()), 403);
        $data = $request->validate([
            'version' => 'required|integer|min:1',
            'portrait' => 'required|file|image|mimes:jpg,jpeg,png,webp|mimetypes:image/jpeg,image/png,image/webp|max:2048|dimensions:min_width=160,min_height=160,max_width=6000,max_height=6000',
        ]);
        $program = ProgramService::program();
        $storedPath = null;
        try {
            return DB::transaction(function () use ($request, $program, $mentor, $data, &$storedPath) {
                $profile = EoaMentorProfile::where('program_id', $program->id)->lockForUpdate()->findOrFail($mentor);
                $this->authorizeEdit($request, $profile);
                abort_unless((int) $data['version'] === $profile->version, 409, 'This mentor profile changed. Reload it before uploading.');
                $file = $request->file('portrait');
                $extension = match ($file->getMimeType()) {
                    'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
                    default => abort(422, 'Choose a JPEG, PNG or WebP portrait.'),
                };
                $storedPath = Storage::disk('public')->putFileAs('eoa/mentors', $file, Str::uuid().'.'.$extension);
                abort_unless($storedPath, 500, 'The portrait could not be saved. Please try again.');
                $before = ['portrait_path' => $profile->portrait_path, 'version' => $profile->version];
                $profile->update(['portrait_path' => '/storage/'.$storedPath, 'version' => $profile->version + 1]);
                AdminAction::log($request->user()->id, 'eoa.mentor_portrait_updated', 'eoa_mentor_profile', $profile->id, null, $before, ['portrait_path' => $profile->portrait_path, 'version' => $profile->version]);

                return response()->json(['data' => $profile->fresh()]);
            });
        } catch (\Throwable $error) {
            if ($storedPath) Storage::disk('public')->delete($storedPath);
            throw $error;
        }
    }

    private function authorizeEdit(Request $request, EoaMentorProfile $profile): void
    {
        abort_if($profile->publication_status === 'published' && ! Access::lead($request->user()), 403);
    }

    private function authorizeChanges(Request $request, array $data, ?EoaMentorProfile $profile = null): void
    {
        if (Access::lead($request->user())) return;
        abort_if(($data['publication_status'] ?? 'draft') === 'published', 403);
        foreach (['appointment_status' => 'draft', 'appointment_reference' => null, 'public_consent' => false, 'consent_reference' => null] as $field => $default) {
            $previous = $profile ? $profile->getAttribute($field) : $default;
            abort_if(array_key_exists($field, $data) && $data[$field] !== $previous, 403, 'Program leadership confirms appointments and public-profile consent.');
        }
    }

    private function validatePublication(array $data): void
    {
        if (($data['publication_status'] ?? 'draft') !== 'published') return;
        Validator::make($data, [
            'name_en' => 'required|string', 'position_en' => 'required|string', 'bio_en' => 'required|string',
            'portrait_path' => ['required', 'string', function (string $attribute, mixed $value, \Closure $fail) {
                // New mentor portraits must have passed the authenticated raster upload flow.
                $uploaded = is_string($value) && preg_match('~\A/storage/eoa/mentors/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:jpg|png|webp)\z~', $value);
                if (! $uploaded || ! Storage::disk('public')->exists(substr($value, strlen('/storage/')))) {
                    $fail('Upload an available mentor portrait before publishing this profile.');
                }
            }], 'appointment_status' => 'required|in:confirmed',
            'appointment_reference' => 'required|string', 'public_consent' => 'required|accepted', 'consent_reference' => 'required|string',
        ], [
            'portrait_path.required' => 'Add a portrait before publishing this mentor.',
            'appointment_status.in' => 'Confirm the mentor appointment before publishing.',
            'public_consent.accepted' => 'Record consent for the public mentor profile before publishing.',
        ])->validate();
    }

    private function validated(Request $request, int $programId, ?int $mentor = null): array
    {
        $required = $mentor ? 'sometimes|required' : 'required';
        $rules = [
            'slug' => [$mentor ? 'sometimes' : 'required', 'required', 'string', 'max:160', 'regex:/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/', Rule::unique('eoa_mentor_profiles')->where('program_id', $programId)->ignore($mentor)],
            'name_en' => $required.'|string|max:255', 'name_ar' => 'nullable|string|max:255',
            'position_en' => $required.'|string|max:255', 'position_ar' => 'nullable|string|max:255',
            'company_name_en' => 'nullable|string|max:255', 'company_name_ar' => 'nullable|string|max:255',
            'company_role_en' => 'nullable|string|max:255', 'company_role_ar' => 'nullable|string|max:255',
            'bio_en' => 'nullable|string|max:2000', 'bio_ar' => 'nullable|string|max:2000',
            'expertise_en' => 'nullable|array|max:6', 'expertise_en.*' => 'required|string|max:80|distinct',
            'expertise_ar' => 'nullable|array|max:6', 'expertise_ar.*' => 'required|string|max:80|distinct',
            'portrait_path' => ['nullable', 'string', 'max:500', 'regex:~\A/(?:eoa/mentors|storage/eoa/mentors)/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)\z~'],
            'portrait_alt_en' => 'nullable|string|max:255', 'portrait_alt_ar' => 'nullable|string|max:255',
            'portrait_position' => ['sometimes', 'required', 'string', 'regex:/\A(?:100|[0-9]{1,2}(?:\.[0-9])?)% (?:100|[0-9]{1,2}(?:\.[0-9])?)%\z/'],
            'display_order' => 'sometimes|required|integer|min:0|max:10000',
            'is_active' => 'sometimes|required|boolean', 'publication_status' => 'sometimes|required|in:draft,published',
            'appointment_status' => 'sometimes|required|in:draft,confirmed', 'appointment_reference' => 'nullable|string|max:2000',
            'public_consent' => 'sometimes|required|boolean', 'consent_reference' => 'nullable|string|max:2000',
            'source_references' => 'nullable|array|max:30', 'source_references.*' => 'required|array:label,url,note',
            'source_references.*.label' => 'required|string|max:255',
            'source_references.*.url' => ['nullable', 'string', 'max:2048', 'url:http,https', $this->webUrl()],
            'source_references.*.note' => 'nullable|string|max:2000',
            'verified_at' => 'nullable|date_format:Y-m-d|before_or_equal:today',
            'coach_user_id' => 'nullable|integer|exists:users,id',
        ];
        if ($mentor) $rules['version'] = 'required|integer|min:1';
        foreach (['company', 'linkedin', 'twitter'] as $platform) {
            $rules[$platform.'_url'] = ['nullable', 'string', 'max:2048', 'url:http,https', $this->webUrl($platform === 'company' ? null : $platform)];
        }
        $data = $request->validate($rules);
        foreach (['public_consent', 'is_active'] as $field) {
            if (array_key_exists($field, $data)) $data[$field] = (bool) $data[$field];
        }
        if (isset($data['version'])) $data['version'] = (int) $data['version'];
        if (! empty($data['coach_user_id'])) {
            $coach = User::findOrFail($data['coach_user_id']);
            abort_unless($coach->hasRole('eoa_coach') && $coach->hasVerifiedEmail(), 422, 'Choose a verified account with the EOA coach role.');
        }

        return $data;
    }

    private function webUrl(?string $platform = null): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($platform) {
            $parts = parse_url($value);
            if (! $parts || isset($parts['user']) || isset($parts['pass']) || preg_match('/[\x00-\x20\\\\]/', $value)) {
                $fail('Use an HTTP or HTTPS address without login credentials.');
                return;
            }
            if (! $platform) return;
            $hosts = $platform === 'linkedin' ? ['linkedin.com', 'www.linkedin.com', 'sa.linkedin.com'] : ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'];
            $path = trim($parts['path'] ?? '', '/');
            $profilePath = $platform === 'linkedin' ? preg_match('~\A(?:in|pub)/[^/]+(?:/[^/]+)*\z~', $path) : preg_match('/\A[a-zA-Z0-9_]{1,15}\z/', $path);
            if (! in_array(strtolower($parts['host'] ?? ''), $hosts, true) || ! $profilePath || isset($parts['port'])) {
                $fail('Use a direct profile link on '.$platform.'.');
            }
        };
    }
}
