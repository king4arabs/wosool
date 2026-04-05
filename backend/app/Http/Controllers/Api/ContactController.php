<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => ['required', Rule::in(['general', 'partnerships', 'sponsorship', 'founder-support', 'media', 'office-hours'])],
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:3000',
            'company' => 'nullable|string|max:255',
        ]);

        \Log::info('Contact inquiry received', $validated);

        return response()->json([
            'message' => 'Thank you for reaching out. We will get back to you within 2-3 business days.',
        ]);
    }
}
