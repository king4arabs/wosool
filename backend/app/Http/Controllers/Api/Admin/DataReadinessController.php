<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DataReadinessController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $operatorId = config('data_operations.operator_user_id');
        $user = $request->user();

        // No account, password, or role is created by this endpoint. A deployment
        // must explicitly nominate an existing verified platform administrator.
        if ((! is_string($operatorId) && ! is_int($operatorId))
            || ! preg_match('/\\A[1-9][0-9]*\\z/', (string) $operatorId)
            || ! $user instanceof User
            || ! $user->isPlatformAdmin()
            || ! $user->hasVerifiedEmail()
            || (string) $user->getKey() !== (string) $operatorId) {
            return response()->json(['message' => 'Forbidden.'], 403)
                ->header('Cache-Control', 'no-store');
        }

        try {
            // Fixed existence probes: do not return rows, counts, or diagnostics.
            DB::table('users')->exists();
            DB::table('founder_profiles')->exists();
        } catch (\Throwable) {
            return response()->json(['status' => 'unavailable'], 503)
                ->header('Cache-Control', 'no-store');
        }

        return response()->json(['status' => 'ready'])->header('Cache-Control', 'no-store');
    }
}
