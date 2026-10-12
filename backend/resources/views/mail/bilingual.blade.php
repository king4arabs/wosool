{{--
  Shared bilingual Wosool email. Arabic first (right-to-left), then English (left-to-right).
  Data comes from App\Mail\BilingualEmail::data(); every value is escaped here.
  Keep lines unindented: indented lines would be treated as Markdown code blocks.
--}}
<x-mail::message>
@foreach (['ar' => 'rtl', 'en' => 'ltr'] as $lang => $dir)
@php($copy = $content[$lang])
<div lang="{{ $lang }}" dir="{{ $dir }}" class="lang-block lang-{{ $lang }}" style="direction: {{ $dir }}; text-align: {{ $dir === 'rtl' ? 'right' : 'left' }};">
<h1>{{ $copy['title'] }}</h1>
@if (!empty($copy['greeting']))
<p>{{ $copy['greeting'] }}</p>
@endif
@foreach ($copy['lines'] as $line)
<p>{{ $line }}</p>
@endforeach
@if (!empty($code))
<p class="code-label">{{ $lang === 'ar' ? 'رمز التفعيل' : 'Activation code' }}</p>
<p class="code" dir="ltr">{{ $code }}</p>
@endif
@if (!empty($details))
<table class="details" role="presentation" width="100%" cellpadding="0" cellspacing="0">
@foreach ($details as $row)
<tr><th style="text-align: {{ $dir === 'rtl' ? 'right' : 'left' }};">{{ $row[$lang] }}</th><td dir="auto" style="text-align: {{ $dir === 'rtl' ? 'right' : 'left' }};">{{ $row['value'] }}</td></tr>
@endforeach
</table>
@endif
@if (!empty($action))
<table class="action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center">
<a href="{{ $action['url'] }}" class="button button-primary" target="_blank" rel="noopener">{{ $action[$lang] }}</a>
</td></tr></table>
@endif
@foreach ($copy['after'] ?? [] as $line)
<p class="note">{{ $line }}</p>
@endforeach
@if (!empty($action))
<p class="fallback">{{ $lang === 'ar' ? 'إذا لم يعمل الزر، انسخ هذا الرابط إلى المتصفح:' : 'If the button does not work, copy this link into your browser:' }}<br><span class="break-all" dir="ltr">{{ $action['url'] }}</span></p>
@endif
</div>
@if ($lang === 'ar')
<hr class="lang-divider">
@endif
@endforeach
</x-mail::message>
