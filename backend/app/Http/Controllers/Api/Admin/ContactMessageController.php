<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAction;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin inbox for messages sent from the public contact form.
 *
 * Messages were already stored and emailed to the team; this gives the team a
 * place to read them when the alert email is missed or fails, and to record
 * which ones have been answered. The sender's IP address is never returned.
 */
class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'answered'])],
            'category' => ['nullable', Rule::in(array_keys(ContactMessage::CATEGORIES))],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = ContactMessage::query()->with('responder:id,name');
        if (($validated['status'] ?? null) === 'open') {
            $query->whereNull('responded_at');
        } elseif (($validated['status'] ?? null) === 'answered') {
            $query->whereNotNull('responded_at');
        }
        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        $page = $query->latest()->latest('id')->paginate($validated['per_page'] ?? 20)->withQueryString();

        return response()->json([
            'data' => collect($page->items())->map(fn (ContactMessage $message) => $this->present($message))->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
                'open' => ContactMessage::whereNull('responded_at')->count(),
                'answered' => ContactMessage::whereNotNull('responded_at')->count(),
            ],
        ]);
    }

    public function update(Request $request, ContactMessage $message): JsonResponse
    {
        $validated = $request->validate(['answered' => ['required', 'boolean']]);
        $before = $this->auditState($message);

        $message->forceFill($validated['answered']
            ? ['responded_at' => $message->responded_at ?? now(), 'responded_by' => $message->responded_by ?? $request->user()->id]
            : ['responded_at' => null, 'responded_by' => null])->save();

        AdminAction::log(
            adminId: $request->user()->id,
            action: $validated['answered'] ? 'contact_message.answered' : 'contact_message.reopened',
            entityType: 'contact_message',
            entityId: $message->id,
            beforeState: $before,
            afterState: $this->auditState($message),
        );

        return response()->json(['data' => $this->present($message->fresh('responder:id,name'))]);
    }

    /** @return array<string, mixed> */
    private function present(ContactMessage $message): array
    {
        [$ar, $en] = ContactMessage::CATEGORIES[$message->category] ?? [$message->category, $message->category];

        return [
            'id' => $message->id,
            'name' => $message->name,
            'email' => $message->email,
            'company' => $message->company,
            'category' => $message->category,
            'category_label' => ['ar' => $ar, 'en' => $en],
            'subject' => $message->subject,
            'message' => $message->message,
            'created_at' => $message->created_at?->toIso8601String(),
            'responded_at' => $message->responded_at?->toIso8601String(),
            'responded_by' => $message->responder ? ['id' => $message->responder->id, 'name' => $message->responder->name] : null,
        ];
    }

    /** Audit only the workflow fields, never the message body or IP address. */
    private function auditState(ContactMessage $message): array
    {
        return ['responded_at' => $message->responded_at?->toIso8601String(), 'responded_by' => $message->responded_by];
    }
}
