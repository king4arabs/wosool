<?php

namespace App\Http\Controllers\Api\Eoa;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\User;
use App\Services\Eoa\Access;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AccountRoleController extends Controller
{
    public const ROLES = ['eoa_lead', 'eoa_staff', 'eoa_reviewer', 'eoa_coach'];

    public function index(Request $request)
    {
        abort_unless(Access::platformAdmin($request->user()), 403);
        $data = $request->validate(['search' => 'nullable|string|min:2|max:255']);
        $query = User::query()->with('roles:id,name');
        if (! empty($data['search'])) {
            $term = $data['search'];
            $query->where(fn ($q) => $q->where('name', 'like', '%'.$term.'%')->orWhere('email', 'like', '%'.$term.'%'));
        } else {
            $query->role(self::ROLES);
        }
        return response()->json(['data' => $query->orderBy('name')->paginate(20)->through(fn ($user) => $this->present($user))]);
    }

    public function update(Request $request, User $account)
    {
        abort_unless(Access::platformAdmin($request->user()), 403);
        $data = $request->validate(['roles' => 'present|array|max:4', 'roles.*' => ['required', 'distinct', Rule::in(self::ROLES)],
            'expected_roles' => 'sometimes|array|max:4', 'expected_roles.*' => ['required', 'distinct', Rule::in(self::ROLES)],
            'reason' => 'nullable|string|max:500']);
        DB::transaction(function () use ($request, $account, $data) {
            $account = User::whereKey($account->id)->lockForUpdate()->firstOrFail();
            $before = $account->getRoleNames()->intersect(self::ROLES)->values()->all();
            if (array_key_exists('expected_roles', $data)) {
                $expected = $data['expected_roles'];
                sort($expected);
                $current = $before;
                sort($current);
                abort_unless($current === $expected, 409, 'Access changed since you opened this account. Search again before saving.');
            }
            abort_if(count(array_diff($data['roles'], $before)) > 0 && ! $account->hasVerifiedEmail(), 422, 'Verify this account email before granting EOA access.');
            foreach (array_diff($before, $data['roles']) as $role) $account->removeRole($role);
            foreach (array_diff($data['roles'], $before) as $role) $account->assignRole($role);
            // Non-EOA privileges and community membership are never replaced.
            AdminAction::log($request->user()->id, 'eoa.roles_updated', 'user', $account->id, null, ['roles' => $before], ['roles' => $data['roles'], 'reason' => $data['reason'] ?? null]);
        });
        return response()->json(['data' => $this->present($account->fresh())]);
    }

    private function present(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'verified' => $user->hasVerifiedEmail(), 'roles' => $user->getRoleNames()->intersect(self::ROLES)->values()->all()];
    }
}
