<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>رمز التحقق | Wosool</title></head>
<body style="margin:0;padding:24px 12px;background:#f4f5fb;font-family:Arial,Tahoma,sans-serif;color:#18223c;">
<div style="display:none;max-height:0;overflow:hidden;">أكمل التحقق من بريدك للانضمام إلى وصول. Verify your email to continue.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e8f2;border-radius:20px;overflow:hidden;">
<tr><td align="center" style="padding:28px 24px;background:#111b35;">
<img src="{{ $message->embed(resource_path('mail/wosool-logo.png')) }}" width="52" height="52" alt="شعار وصول | Wosool" style="display:block;border:0;">
<p style="margin:12px 0 0;font-size:20px;font-weight:bold;color:#fff;">وصول <span dir="ltr">| Wosool</span></p>
</td></tr>
<tr><td align="center" style="padding:28px 24px 12px;">
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.5;">أكّد بريدك الإلكتروني</h1>
<p style="margin:0;font-size:16px;line-height:1.9;">أدخل الرمز التالي لإكمال التسجيل في وصول.</p>
<p lang="en" dir="ltr" style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#59647d;">Enter this code to continue your Wosool registration.</p>
</td></tr>
<tr><td align="center" style="padding:14px 24px;">
<div dir="ltr" style="border:1px solid #d9dfff;border-radius:14px;background:#f1f3ff;padding:20px 12px;font-size:36px;line-height:1.3;font-weight:bold;letter-spacing:9px;color:#3b45d8;">{{ $code }}</div>
</td></tr>
<tr><td align="center" style="padding:8px 24px 28px;color:#59647d;font-size:13px;line-height:1.9;">
<p style="margin:0;">الرمز صالح لمدة 10 دقائق. لا تشاركه مع أي شخص.<br>إذا لم تطلب التسجيل، تجاهل هذه الرسالة.</p>
<p lang="en" dir="ltr" style="margin:12px 0 0;">Expires in 10 minutes. Never share this code.<br>If you did not register, you can ignore this email.</p>
</td></tr>
</table>
<p style="margin:18px 0 0;color:#707b94;font-size:12px;">وصول — مجتمع من المؤسسين إلى المؤسسين<br><span lang="en" dir="ltr">Wosool — Founders to founders</span></p>
</td></tr></table></body></html>
