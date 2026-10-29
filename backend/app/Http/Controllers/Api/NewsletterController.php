<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\Newsletter;
use Illuminate\Http\Request;
class NewsletterController extends Controller
{
    public function subscribe(Request $request, Newsletter $newsletter)
    {
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate(['email' => 'required|email|max:255', 'locale' => 'required|in:ar,en', 'consent' => 'accepted']);
        $newsletter->requestSubscription($data['email'], $data['locale']);
        return response()->json(['message' => __('messages.newsletter.check_inbox')], 202);
    }
    public function confirm(Request $request, Newsletter $newsletter)
    {
        $data = $request->validate(['id' => 'required|integer|min:1', 'token' => 'required|string|size:64']);
        $newsletter->confirm($data['id'], $data['token']);
        return response()->json(['message' => __('messages.newsletter.confirmed')]);
    }
    public function oneClick(Request $request, Newsletter $newsletter, int $id, string $token)
    {
        $request->validate(['List-Unsubscribe' => 'required|in:One-Click']);
        $newsletter->unsubscribe($id, $token);
        return response()->noContent()->header('Cache-Control', 'no-store');
    }
    public function unsubscribe(Request $request, Newsletter $newsletter)
    {
        $data = $request->validate(['id' => 'required|integer|min:1', 'token' => 'required|string|size:64']);
        $newsletter->unsubscribe($data['id'], $data['token']);
        return response()->json(['message' => __('messages.newsletter.unsubscribed')]);
    }
}
