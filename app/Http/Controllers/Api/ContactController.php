<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(StoreContactRequest $request): JsonResponse
    {
        $validated = $request->validated();

        ContactMessage::create([
            ...$validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Thank you for reaching out. We will get back to you within 2-3 business days.',
        ], 201);
    }
}
