وصول | Wosool
رمز التحقق: {{ $code }}
@if ($emailChange)
غيّرت البريد الإلكتروني لحسابك. أدخل الرمز لتأكيد العنوان الجديد. صالح لمدة 10 دقائق. لا تشاركه مع أي شخص.
إذا لم تطلب استخدام هذا البريد لحساب في وصول، تجاهل هذه الرسالة.

Verification code: {{ $code }}
You changed the email address on your Wosool account. Enter this code to confirm the new address. Expires in 10 minutes. Never share it.
If you did not ask to use this address for a Wosool account, ignore this email.
@else
أدخل الرمز لإكمال التسجيل. صالح لمدة 10 دقائق. لا تشاركه مع أي شخص.
إذا لم تطلب التسجيل، تجاهل هذه الرسالة.

Verification code: {{ $code }}
Enter this code to continue registration. Expires in 10 minutes. Never share it.
If you did not register, ignore this email.
@endif
