وصول | Wosool
{{ $language === 'ar' ? ($kind === 'confirm' ? 'أكّد اشتراكك في نشرة وصول خلال 48 ساعة.' : 'أهلاً بك في نشرة وصول: أخبار ومقتطفات شهرية للمؤسسين.') : ($kind === 'confirm' ? 'Confirm your Wosool subscription within 48 hours.' : 'Welcome to Wosool: monthly news and highlights for founders.') }}
{{ $period }}
@foreach ($stories as $story)
{{ $story['title'] }} — {{ $story['date'] }}
{{ $story['excerpt'] }}
{{ $story['url'] }}

@endforeach
@if (count($members))
{{ $language === 'ar' ? 'أهلاً بالأعضاء الجدد' : 'Welcome our new members' }}
@foreach ($members as $member)
{{ $member['name'] }}@if (!empty($member['company'])) · {{ $member['company'] }}@endif — {{ $member['url'] }}
@endforeach
@endif
@if (count($events))
{{ $language === 'ar' ? 'في أجندة المجتمع' : 'Coming up in the community' }}
@foreach ($events as $event)
{{ $event['title'] }} — {{ $event['date'] }}
{{ $event['url'] }}
@endforeach
@endif
{{ $actionUrl }}
@if ($kind !== 'confirm')
{{ $language === 'ar' ? 'جميع الأخبار:' : 'All news:' }} {{ rtrim(config('app.frontend_url'), '/') }}/news
{{ $language === 'ar' ? 'الفعاليات القادمة:' : 'Upcoming events:' }} {{ rtrim(config('app.frontend_url'), '/') }}/events
@endif
@if ($kind !== 'confirm')
{{ $language === 'ar' ? 'إلغاء الاشتراك:' : 'Unsubscribe:' }} {{ $unsubscribeUrl }}
@else
{{ $language === 'ar' ? 'إذا لم تطلب الاشتراك، تجاهل الرسالة.' : 'If you did not subscribe, ignore this message.' }}
@endif
info@wosool.org
