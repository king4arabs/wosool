<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FounderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FounderProfile::query()
            ->with(['user', 'companies', 'scorecard', 'latestInvitation', 'outreach'])
            ->withCount('companies');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('display_name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('translations->ar->name', 'like', "%{$search}%")
                    ->orWhere('tagline', 'like', "%{$search}%")
                    ->orWhere('sector', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%"));
            });
        }

        foreach (['status', 'sector', 'stage'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        if ($request->input('activation') === 'unclaimed') { $query->whereNull('user_id'); }
        if ($request->input('activation') === 'active') { $query->whereNotNull('user_id'); }

        $founders = $query
            ->latest()
            ->paginate(max(1, min(100, $request->integer('per_page', 20))))
            ->withQueryString();

        return response()->json([
            'data' => FounderResource::collection(collect($founders->items())),
            'meta' => [
                'total' => $founders->total(),
                'last_page' => $founders->lastPage(),
                'unclaimed' => FounderProfile::whereNull('user_id')->count(),
                'claimed' => FounderProfile::whereNotNull('user_id')->count(),
                'current_page' => $founders->currentPage(),
                'per_page' => $founders->perPage(),
                'active' => FounderProfile::where('status', 'active')->count(),
                'pending' => FounderProfile::where('status', 'pending')->count(),
                'featured' => FounderProfile::where('is_featured', true)->count(),
            ],
            'links' => [
                'next' => $founders->nextPageUrl(),
                'prev' => $founders->previousPageUrl(),
            ],
        ]);
    }

    public function import(\App\Services\FounderDirectoryImporter $importer, Request $request): JsonResponse
    {
        $counts = $importer->run();
        \App\Models\AdminAction::log($request->user()->id, 'founder_directory_imported', 'founder_directory', 0, json_encode($counts));
        return response()->json(['data' => $counts]);
    }

    public function invite(Request $request, FounderProfile $founder, \App\Services\FounderInvitationService $service): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'recipient_evidence' => ['required', 'string', 'min:10', 'max:2000'],
            'recipient_verified' => ['accepted'],
        ]);
        $invite = $service->send($founder, $request->user(), $data['email'], $data['recipient_evidence']);
        return response()->json(['message' => 'Invitation accepted by the mail transport.', 'data' => ['status' => $invite->status, 'expires_at' => $invite->expires_at->toIso8601String()]]);
    }

    public function revoke(Request $request, FounderProfile $founder): JsonResponse
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($founder, $request) {
            $founder = FounderProfile::lockForUpdate()->findOrFail($founder->id);
            $founder->invitations()->whereIn('status', ['sent', 'pending'])->update(['status' => 'revoked']);
            \App\Models\AdminAction::log($request->user()->id, 'founder_invitation_revoked', 'founder_profile', $founder->id);
        });
        return response()->json(['message' => 'Outstanding invitations revoked.']);
    }

    public function update(Request $request, FounderProfile $founder): JsonResponse
    {
        $data = $request->validate([
            'is_public' => ['sometimes', 'boolean'], 'is_featured' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:active,pending,suspended'],
            'is_verified' => ['sometimes', 'boolean'],
        ]);
        if (array_key_exists('is_verified', $data)) {
            // Verification is the admin review that also vets a founder for introductions.
            $data['vetted_status'] = $data['is_verified'];
        }
        $before = $founder->only(array_keys($data));
        $founder->update($data);
        \App\Models\AdminAction::log($request->user()->id, 'founder_profile_moderated', 'founder_profile', $founder->id, null, $before, $data);
        return response()->json(['data' => new FounderResource($founder->load(['user', 'companies', 'latestInvitation']))]);
    }
}
