<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Services\AcceleratorGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function ready(): JsonResponse
    {
        try {
            DB::select('select 1');
            DB::table('ecosystem_records')->limit(1)->count();
            DB::table('eoa_documents')->limit(1)->count();
            DB::table('eoa_notifications')->limit(1)->count();
            $ready = Program::where('slug', AcceleratorGateway::SLUG)->exists()
                && count(array_diff(array_keys(app('migrator')->getMigrationFiles(database_path('migrations'))), app('migration.repository')->getRan())) === 0;
        } catch (\Throwable) {
            $ready = false;
        }

        return response()->json(['status' => $ready ? 'ready' : 'unavailable'], $ready ? 200 : 503)
            ->header('Cache-Control', 'no-store');
    }

    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'version' => '1.0.0',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
