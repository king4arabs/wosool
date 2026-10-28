@php($ar = $language === 'ar')
<!doctype html><html lang="{{ $language }}" dir="{{ $ar ? 'rtl' : 'ltr' }}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{ $ar ? 'نشرة وصول' : 'Wosool updates' }}</title></head>
<body style="margin:0;padding:24px 12px;background:#f4f5fb;color:#18223c;font-family:Arial,Tahoma,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">{{ $ar ? 'مختارات المجتمع وروابط مفيدة للمؤسسين.' : 'Community highlights and useful links for founders.' }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e5e8f2;border-radius:20px;overflow:hidden;">
<tr><td align="center" style="padding:28px;background:#111b35;color:white;"><img src="{{ $message->embed(resource_path('mail/wosool-logo.png')) }}" alt="{{ $ar ? 'شعار وصول' : 'Wosool logo' }}" width="52" height="52" style="display:block;border:0;"><p style="margin:12px 0 0;font-size:22px;font-weight:bold;">وصول | Wosool</p></td></tr>
<tr><td style="padding:28px 24px;line-height:1.9;">
<h1 style="margin:0 0 12px;font-size:25px;">{{ $kind === 'confirm' ? ($ar ? 'خطوة واحدة للاشتراك' : 'One step to subscribe') : ($kind === 'welcome' ? ($ar ? 'أهلاً بك في مجتمع وصول' : 'Welcome to the Wosool community') : ($ar ? 'مختارات هذا الشهر' : 'This month at Wosool')) }}</h1>
<p style="margin:0 0 24px;color:#59647d;">{{ $kind === 'confirm' ? ($ar ? 'أكّد بريدك لتصلك أخبار ريادة الأعمال ومقتطفات مختارة من وصول. الرابط صالح لمدة 48 ساعة.' : 'Confirm your email for entrepreneurship news and selected Wosool highlights. This link expires in 48 hours.') : ($kind === 'welcome' ? ($ar ? 'يسعدنا انضمامك. ستصلك نشرة شهرية بأهم الأخبار والمقتطفات وروابط القراءة.' : 'We’re glad you’re here. Look out for a monthly selection of news, short insights and links to read more.') : ($ar ? 'أخبار ومقتطفات مختارة للمؤسسين، في قراءة سريعة.' : 'A quick selection of news and insights for founders.')) }}</p>
@if ($period)<p style="margin:0 0 18px;color:#66718a;font-size:13px;">{{ $period }}</p>@endif
@if (count($stories))<h2 style="font-size:20px;margin:24px 0 8px;">{{ $ar ? 'أهم التحديثات' : 'Key updates' }}</h2>@endif
@foreach ($stories as $story)
<div style="border-top:1px solid #e5e8f2;padding:22px 0;"><p style="margin:0;color:#66718a;font-size:12px;">{{ $story['date'] }}</p><h2 style="margin:6px 0;font-size:19px;line-height:1.6;">{{ $story['title'] }}</h2><p style="margin:0 0 10px;font-size:15px;color:#59647d;">{{ $story['excerpt'] }}</p><a href="{{ $story['url'] }}" style="color:#4437e5;font-weight:bold;">{{ $ar ? 'اقرأ الخبر' : 'Read the story' }} →</a></div>
@endforeach
@if (count($members))
<div style="padding:20px;background:#f1f3ff;border-radius:12px;margin:20px 0;"><h2 style="margin:0 0 8px;font-size:20px;">{{ $ar ? 'أهلاً بالأعضاء الجدد' : 'Welcome our new members' }}</h2><p style="margin:0 0 12px;color:#59647d;font-size:14px;">{{ $ar ? 'تعرّف على مؤسسين انضموا إلى المجتمع، وابدأ بتعارف مهني.' : 'Meet founders who joined the community and make a new connection.' }}</p>
@foreach ($members as $member)<p style="margin:8px 0;"><a href="{{ $member['url'] }}" style="color:#4437e5;font-weight:bold;">{{ $member['name'] }}</a></p>@endforeach
</div>
@endif
@if (count($events))
<h2 style="font-size:20px;margin:24px 0 8px;">{{ $ar ? 'في أجندة المجتمع' : 'Coming up in the community' }}</h2>
@foreach ($events as $event)<p style="padding:12px 0;border-bottom:1px solid #e5e8f2;margin:0;"><span style="font-size:12px;color:#66718a;">{{ $event['date'] }}</span><br><a href="{{ $event['url'] }}" style="color:#4437e5;font-weight:bold;">{{ $event['title'] }}</a></p>@endforeach
@endif
<p style="margin:24px 0 8px;"><a href="{{ $actionUrl }}" style="display:inline-block;background:#4437e5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:10px;font-weight:bold;">{{ $kind === 'confirm' ? ($ar ? 'تأكيد الاشتراك' : 'Confirm subscription') : ($ar ? 'استكشف مجتمع وصول' : 'Explore the Wosool community') }}</a></p>
</td></tr><tr><td style="padding:20px 24px;background:#f8f9fd;font-size:12px;line-height:1.9;color:#66718a;">
<p style="margin:0;">{{ $ar ? 'تصلك هذه الرسالة لاشتراكك في النشرة أو لعضويتك المفعّلة في وصول.' : 'You receive these updates as a newsletter subscriber or an active Wosool member.' }}</p>
@if ($kind === 'confirm')<p>{{ $ar ? 'إذا لم تطلب الاشتراك، تجاهل هذه الرسالة. لن تُضاف إلى النشرة دون تأكيدك.' : 'If you did not subscribe, ignore this email. You will not be added without confirmation.' }}</p>@else<a href="{{ $unsubscribeUrl }}" style="color:#59647d;">{{ $ar ? 'إلغاء الاشتراك' : 'Unsubscribe' }}</a>@endif
<p style="margin:12px 0 0;">{{ $ar ? 'لديك اقتراح للنشرة؟ يسعدنا ردّك.' : 'Have an idea for the newsletter? Reply and let us know.' }}</p>
<a href="mailto:info@wosool.org" style="color:#59647d;">info@wosool.org</a>
</td></tr></table></td></tr></table></body></html>
