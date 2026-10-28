وصول | Wosool
{{ $locale === 'ar' ? ($kind === 'confirm' ? 'أكّد اشتراكك في نشرة وصول خلال 48 ساعة.' : 'أهلاً بك في نشرة وصول: أخبار ومقتطفات أسبوعية للمؤسسين.') : ($kind === 'confirm' ? 'Confirm your Wosool subscription within 48 hours.' : 'Welcome to Wosool: weekly news and highlights for founders.') }}
@foreach ($stories as $story)
{{ $story['title'] }} — {{ $story['date'] }}
{{ $story['excerpt'] }}
{{ $story['url'] }}

@endforeach
{{ $actionUrl }}
@if ($kind !== 'confirm')
{{ $locale === 'ar' ? 'إلغاء الاشتراك:' : 'Unsubscribe:' }} {{ $unsubscribeUrl }}
@else
{{ $locale === 'ar' ? 'إذا لم تطلب الاشتراك، تجاهل الرسالة.' : 'If you did not subscribe, ignore this message.' }}
@endif
info@wosool.org
