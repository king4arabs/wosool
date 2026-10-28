<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Mail\WosoolMail;
use App\Models\ContactMessage;
use App\Services\Mailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(StoreContactRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $message = ContactMessage::create([
            ...$validated,
            'ip_address' => $request->ip(),
        ]);

        [$categoryAr, $categoryEn] = ContactMessage::CATEGORIES[$validated['category']];
        Mailer::safely($validated['email'], WosoolMail::contactReceived($validated['name'], $validated['subject']), ['contact_message_id' => $message->id]);
        Mailer::safely(Mailer::team(), WosoolMail::teamAlert(
            "رسالة جديدة ({$categoryAr}): {$validated['subject']}",
            "New message ({$categoryEn}): {$validated['subject']}",
            [
                ['ar' => 'الاسم', 'en' => 'Name', 'value' => $validated['name']],
                ['ar' => 'البريد', 'en' => 'Email', 'value' => $validated['email']],
                ['ar' => 'الجهة', 'en' => 'Organisation', 'value' => $validated['company'] ?? null],
                ['ar' => 'التصنيف', 'en' => 'Category', 'value' => "{$categoryAr} / {$categoryEn}"],
                ['ar' => 'الرسالة', 'en' => 'Message', 'value' => $validated['message']],
            ],
            '/admin/messages',
            $validated['email'],
            $validated['name'],
        ), ['contact_message_id' => $message->id]);

        return response()->json([
            'message' => 'Thank you for reaching out. We will get back to you within 2-3 business days.',
        ], 201);
    }
}
