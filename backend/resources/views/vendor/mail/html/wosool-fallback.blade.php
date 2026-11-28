@props(['url', 'lang' => 'en'])
<p class="fallback">{{ $lang === 'ar' ? 'إذا لم يعمل الزر، انسخ هذا الرابط إلى المتصفح:' : 'If the button does not work, copy this link into your browser:' }}<br><span class="break-all" dir="ltr">{{ $url }}</span></p>
