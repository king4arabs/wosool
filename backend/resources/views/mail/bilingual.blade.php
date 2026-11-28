{{--
  Shared bilingual Wosool email. Arabic first (right-to-left), then English (left-to-right).
  Data comes from App\Mail\BilingualEmail::data(); every value is escaped here.
  Keep lines unindented: indented lines would be treated as Markdown code blocks.
  The wosool-* components have html/ and text/ versions under views/vendor/mail, so the
  plain-text part gets readable "Label: value" rows and "Action: URL" links.
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
<p class="code-label">{{ $codeLabel[$lang] ?? ($lang === 'ar' ? 'رمز التفعيل' : 'Activation code') }}</p>
<p class="code" dir="ltr">{{ $code }}</p>
@endif
@if (!empty($details))
<x-mail::wosool-details :rows="$details" :lang="$lang" :dir="$dir" />
@endif
@if (!empty($action))
<x-mail::wosool-button :url="$action['url']">{{ $action[$lang] }}</x-mail::wosool-button>
@endif
@foreach ($copy['after'] ?? [] as $line)
<p class="note">{{ $line }}</p>
@endforeach
@if (!empty($action))
<x-mail::wosool-fallback :url="$action['url']" :lang="$lang" />
@endif
</div>
@if ($lang === 'ar')
<hr class="lang-divider">
@endif
@endforeach
</x-mail::message>
