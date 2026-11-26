{{-- Plain-text part (text/plain): output is unescaped on purpose so names like "A & B" or "Ali's" are not sent as HTML entities. Keep the wording in step with mail/newsletter.blade.php. --}}
@php($ar = $language === 'ar')
@php($site = rtrim(config('app.frontend_url'), '/'))
وصول | Wosool

{!! $kind === 'confirm' ? ($ar ? 'خطوة واحدة للاشتراك' : 'One step to subscribe') : ($kind === 'welcome' ? ($ar ? 'أهلاً بك في مجتمع وصول' : 'Welcome to the Wosool community') : ($ar ? 'مختارات هذا الشهر' : 'This month at Wosool')) !!}
{!! $kind === 'confirm' ? ($ar ? 'أكّد بريدك لتصلك أخبار ريادة الأعمال ومقتطفات مختارة من وصول. الرابط صالح لمدة 48 ساعة.' : 'Confirm your email for entrepreneurship news and selected Wosool highlights. This link expires in 48 hours.') : ($kind === 'welcome' ? ($ar ? 'يسعدنا انضمامك. ستصلك نشرة شهرية بأهم الأخبار والمقتطفات وروابط القراءة.' : 'We’re glad you’re here. Look out for a monthly selection of news, short insights and links to read more.') : ($ar ? 'أهم ما نُشر في وصول، مع أعضاء جدد وفرص للقاء المجتمع. اختر ما يهمك وتابع التفاصيل.' : 'Highlights from Wosool, new members and opportunities to meet the community. Explore what matters to you.')) !!}
@if ($period)
{!! $period !!}
@endif
@if (count($stories))

{{ $ar ? 'أهم التحديثات' : 'Key updates' }}
@foreach ($stories as $story)

{!! $story['title'] !!} — {!! $story['date'] !!}
{!! $story['excerpt'] !!}
{!! $story['url'] !!}
@endforeach
@endif
@if (count($members))

{{ $ar ? 'أهلاً بالأعضاء الجدد' : 'Welcome our new members' }}
@foreach ($members as $member)
{!! $member['name'] !!}@if (!empty($member['company'])) · {!! $member['company'] !!}@endif — {!! $member['url'] !!}
@endforeach
@endif
@if (count($events))

{{ $ar ? 'في أجندة المجتمع' : 'Coming up in the community' }}
@foreach ($events as $event)
{!! $event['title'] !!} — {!! $event['date'] !!}
{!! $event['url'] !!}
@endforeach
@endif

{{ $kind === 'confirm' ? ($ar ? 'تأكيد الاشتراك:' : 'Confirm subscription:') : ($ar ? 'استكشف مجتمع وصول:' : 'Explore the Wosool community:') }} {!! $actionUrl !!}
@if ($kind !== 'confirm')
{{ $ar ? 'جميع الأخبار:' : 'All news:' }} {!! $site !!}/news
{{ $ar ? 'الفعاليات القادمة:' : 'Upcoming events:' }} {!! $site !!}/events

{{ $ar ? 'إلغاء الاشتراك:' : 'Unsubscribe:' }} {!! $unsubscribeUrl !!}
@else

{{ $ar ? 'إذا لم تطلب الاشتراك، تجاهل هذه الرسالة. لن تُضاف إلى النشرة دون تأكيدك.' : 'If you did not subscribe, ignore this email. You will not be added without confirmation.' }}
@endif
info@wosool.org
