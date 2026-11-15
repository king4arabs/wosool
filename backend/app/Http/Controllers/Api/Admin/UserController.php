<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\{Application, FounderProfile, User};
use App\Services\FounderIdentityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /** Real accounts and unclaimed directory records share one private, paginated work list. */
    public function index(Request $request)
    {
        $data = $request->validate(['search' => 'nullable|string|max:120', 'origin' => 'nullable|in:registered,invited', 'per_page' => 'sometimes|integer|min:1|max:100']);
        $registered = DB::table('users')->select(['users.id', 'users.name', 'users.email', 'users.created_at'])
            ->selectRaw("'registered' as origin, users.id as user_id, NULL as founder_profile_id");
        $invited = DB::table('founder_profiles')->whereNull('deleted_at')->whereNull('user_id')
            ->select(['id', 'display_name as name', DB::raw('NULL as email'), 'created_at'])
            ->selectRaw("'invited' as origin, NULL as user_id, id as founder_profile_id");
        $query = DB::query()->fromSub($registered->unionAll($invited), 'people');
        if ($request->filled('origin')) $query->where('origin', $data['origin']);
        if ($search = trim($data['search'] ?? '')) $query->where(fn ($q) => $q->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%'));
        $page = $query->orderByDesc('created_at')->orderBy('origin')->orderByDesc('id')->paginate($request->integer('per_page', 20));
        $ids = collect($page->items())->where('origin', 'registered')->pluck('user_id');
        $users = User::with('founderProfile.companies')->whereIn('id', $ids)->get()->keyBy('id');
        $applications = Application::whereIn('user_id', $ids)->latest('id')->get()->unique('user_id')->keyBy('user_id');
        $profiles = FounderProfile::with(['companies', 'latestInvitation', 'outreach'])->whereIn('id', collect($page->items())->where('origin', 'invited')->pluck('founder_profile_id'))->get()->keyBy('id');
        $rows = collect($page->items())->map(function ($row) use ($users, $profiles, $applications) {
            $user = $row->origin === 'registered' ? $users->get($row->user_id) : null;
            $profile = $user ? $user->founderProfile : $profiles->get($row->founder_profile_id);
            $application = $user ? $applications->get($user->id) : null;
            $company = $profile?->companies->first(fn ($item) => (bool) $item->pivot->is_primary) ?? $profile?->companies->first();
            return ['key' => $row->origin.':'.$row->id, 'origin' => $row->origin, 'user_id' => $user?->id,
                'founder_profile_id' => $profile?->id, 'founder_uid' => $profile?->founder_uid,
                'name' => $user?->name ?? $profile?->display_name, 'email' => $user?->email ?? $profile?->outreach?->email ?? $profile?->latestInvitation?->email,
                'email_verified' => (bool) $user?->hasVerifiedEmail(), 'admin_verified' => (bool) $profile?->is_verified,
                'company' => $company?->name ?? $application?->company_name, 'application_id' => $application?->id,
                'application_status' => $application?->status, 'profile_slug' => $profile?->slug,
                'invitation_status' => $profile?->latestInvitation?->status, 'outreach_status' => $profile?->outreach?->status];
        });
        return response()->json(['data' => $rows, 'meta' => ['total' => $page->total(), 'current_page' => $page->currentPage(),
            'last_page' => $page->lastPage(), 'registered' => User::count(), 'invited' => FounderProfile::whereNull('user_id')->count()]])->header('Cache-Control', 'no-store');
    }

    public function identity(User $user, FounderIdentityService $service)
    {
        $review = $service->refresh($user);
        $application = Application::where('user_id', $user->id)->latest('id')->first();
        $profile = $user->founderProfile;
        return response()->json(['data' => ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'email_verified' => $user->hasVerifiedEmail()], 'application' => $application ? new ApplicationResource($application) : null,
            'profile' => $profile ? ['id' => $profile->id, 'slug' => $profile->slug, 'founder_uid' => $profile->founder_uid, 'verified' => (bool) $profile->is_verified] : null,
            'candidates' => $review?->reviewed_at ? [] : ($review?->candidates ?? []),
            'decision' => $review?->decision, 'reviewed_at' => $review?->reviewed_at?->toIso8601String()]])->header('Cache-Control', 'no-store');
    }

    public function verify(Request $request, User $user)
    {
        abort_unless($user->hasVerifiedEmail(), 409, __('identity.email'));
        $request->validate(['identity_verified' => 'accepted']);
        $application = Application::where('user_id', $user->id)->latest('id')->first();
        if ($application?->onboarding_data) {
            $request->merge(['status' => 'approved']);
            return app(ApplicationController::class)->update($request, $application);
        }
        $profile = $user->founderProfile;
        abort_unless($profile, 409, __('identity.complete'));
        $request->merge(['is_verified' => true]);
        return app(FounderController::class)->update($request, $profile);
    }
}
