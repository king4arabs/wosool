<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Application, User};
use App\Services\{Mailer, MembershipRegistration};
use App\Mail\WosoolMail;
use App\Support\DirectoryGeography;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Storage};
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RegistrationController extends Controller
{
    public function show(Request $request)
    {
        $application = Application::where('user_id', $request->user()->id)->latest('id')->first();
        return response()->json(['step' => MembershipRegistration::state($request->user()), 'application' => $application ? $application->only(['id', 'full_name', 'phone', 'company_name', 'company_website', 'sector', 'stage', 'location', 'motivation', 'what_you_offer', 'what_you_need', 'linkedin_url', 'status', 'onboarding_data']) : null])->header('Cache-Control', 'no-store');
    }

    public function submit(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255', 'phone' => 'required|string|max:50',
            'company_name' => 'required|string|max:255', 'company_website' => 'required|url:http,https|max:255',
            'sector' => 'required|string|max:100', 'stage' => ['required', Rule::in(['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Scale-up', 'Exited'])],
            'location' => 'required|string|max:255', 'motivation' => 'required|string|max:2000',
            'what_you_offer' => 'required|string|max:1000', 'what_you_need' => 'required|string|max:1000',
            'linkedin_url' => 'nullable|url:http,https|max:255', 'country_code' => ['required', Rule::in(DirectoryGeography::policy()['country_codes'])],
            'position' => 'required|string|max:120', 'bio' => 'required|string|min:20|max:1500',
            'company_description' => 'required|string|min:20|max:2000',
            'founded_year' => 'required|integer|min:1800|max:'.now()->year, 'team_size' => 'required|integer|min:1|max:10000000',
            'public_profile_consent' => 'accepted',
        ]);
        $application = DB::transaction(function () use ($request, $data) {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $application = Application::where('user_id', $user->id)->latest('id')->lockForUpdate()->first();
            abort_if($application?->onboarding_data && in_array($application->status, ['submitted', 'reviewing', 'waitlisted', 'approved']), 409, 'طلبك قيد المراجعة أو معتمد. Your application is under review or approved.');
            $application ??= new Application(['user_id' => $user->id]);
            $preapproved = $application->status === 'approved';
            $assets = [...collect($application->onboarding_data ?? [])->only(['avatar_url', 'logo_url'])->all(), ...($request->hasSession() ? $request->session()->get('registration_assets', []) : [])];
            $application->fill(collect($data)->only(['full_name', 'phone', 'company_name', 'company_website', 'sector', 'stage', 'location', 'motivation', 'what_you_offer', 'what_you_need', 'linkedin_url'])->all());
            $application->email = $user->email;
            $application->onboarding_data = [...collect($data)->only(['country_code', 'position', 'bio', 'company_description', 'founded_year', 'team_size'])->all(), ...$assets, 'public_profile_consent_at' => now()->toIso8601String()];
            $application->status = $preapproved ? 'approved' : 'submitted';
            if (! $preapproved) { $application->reviewed_at = null; $application->reviewed_by = null; }
            $application->save();
            if (! $user->community_registration_started_at) $user->forceFill(['community_registration_started_at' => now()])->save();
            if ($preapproved) app(MembershipRegistration::class)->publish($application);
            return $application;
        });
        if ($request->hasSession()) $request->session()->forget('registration_assets');
        Mailer::safely($application->email, WosoolMail::membershipStatus($application->status === 'approved'), ['application_id' => $application->id]);
        Mailer::safely(Mailer::team(), WosoolMail::teamAlert('طلب عضوية جديد', 'New membership application', [['ar' => 'الاسم', 'en' => 'Name', 'value' => $application->full_name], ['ar' => 'الشركة', 'en' => 'Company', 'value' => $application->company_name]], '/admin/members'), ['application_id' => $application->id]);
        return response()->json(['step' => MembershipRegistration::state($request->user()->fresh()), 'status' => $application->status], 201);
    }

    public function upload(Request $request)
    {
        abort_unless($request->hasSession(), 409, 'Sign in again to upload images. سجّل الدخول مجددًا لرفع الصور.');
        $request->validate(['kind' => 'required|in:avatar,logo', 'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|mimetypes:image/jpeg,image/png,image/webp|max:2048|dimensions:min_width=64,min_height=32,max_width=6000,max_height=6000']);
        $application = Application::where('user_id', $request->user()->id)->latest('id')->first();
        abort_if($application?->onboarding_data && ! in_array($application->status, ['rejected', 'request_more_info']), 409, 'استخدم إعدادات الملف بعد الموافقة. Use profile settings after approval.');
        $kind = $request->input('kind');
        $file = $request->file('image');
        $extension = match ($file->getMimeType()) { 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp' };
        $path = Storage::disk('public')->putFileAs('registration/'.$request->user()->id, $file, Str::uuid().'.'.$extension);
        abort_unless($path, 503, 'تعذر حفظ الصورة. Unable to save image.');
        $key = $kind === 'avatar' ? 'avatar_url' : 'logo_url';
        $previous = $request->session()->get('registration_assets.'.$key);
        $url = '/storage/'.$path;
        $request->session()->put('registration_assets.'.$key, $url);
        if ($previous && str_starts_with($previous, '/storage/registration/'.$request->user()->id.'/')) Storage::disk('public')->delete(substr($previous, strlen('/storage/')));
        return response()->json(['url' => $url]);
    }
}
