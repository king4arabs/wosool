<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'company_website' => 'nullable|url|max:500',
            'sector' => 'nullable|string|max:100',
            'stage' => ['nullable', Rule::in(['pre-seed', 'seed', 'series-a', 'series-b', 'growth', 'exited'])],
            'location' => 'nullable|string|max:255',
            'motivation' => 'required|string|max:2000',
            'what_you_offer' => 'nullable|string|max:1000',
            'what_you_need' => 'nullable|string|max:1000',
            'linkedin_url' => 'nullable|url|max:500',
            'referral_source' => 'nullable|string|max:100',
            'referrer_name' => 'nullable|string|max:255',
        ]);

        $application = Application::create($validated);

        return response()->json([
            'message' => 'Application submitted successfully. We will review it and get back to you within 5-7 business days.',
            'reference' => 'WOS-' . str_pad($application->id, 5, '0', STR_PAD_LEFT),
        ], 201);
    }
}
