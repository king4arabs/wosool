<x-mail::message>
# تم قبول طلبك | Your application is approved

مرحباً {{ $fullName }}،

@if ($existingAccount)
تمت الموافقة على طلب انضمامك إلى وصول. سجّل الدخول بحسابك الحالي لتفعيل عضويتك.
@else
تمت الموافقة على طلب انضمامك إلى وصول. استخدم رابط الدعوة الخاص أدناه لإنشاء حسابك وتفعيل عضويتك.
@endif

Hello {{ $fullName }},

@if ($existingAccount)
Your Wosool application has been approved. Sign in with your existing account to activate your membership.
@else
Your Wosool application has been approved. Use the private invitation link below to create your account and activate your membership.
@endif

<x-mail::button :url="$actionUrl">
{{ $existingAccount ? 'تسجيل الدخول | Sign in' : 'تفعيل الحساب | Activate account' }}
</x-mail::button>

@unless ($existingAccount)
هذا الرابط خاص بك؛ لا تشاركه مع أي شخص. This link is personal to you — please do not share it.
@endunless

وصول | Wosool
</x-mail::message>
