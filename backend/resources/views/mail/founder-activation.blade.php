<x-mail::message>
# تفعيل ملف المؤسس | Activate your founder profile

مرحباً {{ $founderName }}،

ندعوك لتفعيل ملفك في وصول لمراجعة بياناتك وشركتك والتواصل مع مجتمع المؤسسين.

Hello {{ $founderName }},

You're invited to claim your Wosool founder profile. Activate it to review your profile and company information and connect with the founder community.

**١. افتح رابط التفعيل | 1. Open your activation link**

<x-mail::button :url="$activationUrl">
تفعيل الملف | Activate profile
</x-mail::button>

**٢. أدخل رمز التفعيل في النموذج | 2. Enter this code in the activation form**

# {{ $code }}

الرابط والرمز صالحان لمدة ٧ أيام ويُستخدمان مرة واحدة. التفعيل اختياري؛ إذا لم تكن صاحب الملف، تجاهل هذه الرسالة ولا تشارك الرابط أو الرمز.

The link and code expire in 7 days and can be used once. Activation is optional. If this profile is not yours, ignore this email and do not share the link or code.

وصول | Wosool
</x-mail::message>
