<?php

namespace App\Http\Middleware;

use App\Models\Program;
use App\Services\Eoa\ProgramService;
use Closure;
use Illuminate\Http\Request;

class CanonicalEoaProgram
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->isMethodSafe()) {
            $bound = $request->route('program');
            $program = $bound instanceof Program ? $bound : ($bound ? Program::find($bound) : null);
            abort_if($program?->slug === ProgramService::SLUG || $request->input('slug') === ProgramService::SLUG,
                409, 'Use /EOA/admin for audited program changes and enrollment controls.');
        }

        return $next($request);
    }
}
