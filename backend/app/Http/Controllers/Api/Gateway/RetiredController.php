<?php

namespace App\Http\Controllers\Api\Gateway;

use App\Http\Controllers\Controller;

class RetiredController extends Controller
{
    public function __invoke()
    {
        // Never redirect writes: the two payload and approval models differ.
        return response()->json([
            'message' => 'Continue in /EOA. The previous application workflow is read-only; existing records are retained. / تابع في /EOA. المسار السابق للقراءة فقط والبيانات محفوظة.',
            'code' => 'eoa_canonical_workflow', 'url' => '/EOA/account',
        ], 410)->header('Cache-Control', 'private, no-store')->header('X-Robots-Tag', 'noindex, nofollow');
    }
}
