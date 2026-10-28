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
        return response()->json(['message' => 'تحقق من بريدك لتأكيد الاشتراك. Check your inbox to confirm your subscription.'], 202);
    }
    public function confirm(Request $request, Newsletter $newsletter)
    {
        $data = $request->validate(['id' => 'required|integer|min:1', 'token' => 'required|string|size:64']);
        $newsletter->confirm($data['id'], $data['token']);
        return response()->json(['message' => 'تم تأكيد اشتراكك. Subscription confirmed.']);
    }
    public function unsubscribe(Request $request, Newsletter $newsletter)
    {
        $data = $request->validate(['id' => 'required|integer|min:1', 'token' => 'required|string|size:64']);
        $newsletter->unsubscribe($data['id'], $data['token']);
        return response()->json(['message' => 'تم إلغاء الاشتراك. Unsubscribed.']);
    }
}
