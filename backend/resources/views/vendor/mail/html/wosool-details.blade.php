@props(['rows' => [], 'lang' => 'en', 'dir' => 'ltr'])
<table class="details" role="presentation" width="100%" cellpadding="0" cellspacing="0">
@foreach ($rows as $row)
<tr><th style="text-align: {{ $dir === 'rtl' ? 'right' : 'left' }};">{{ $row[$lang] }}</th><td dir="auto" style="text-align: {{ $dir === 'rtl' ? 'right' : 'left' }};">{{ $row['value'] }}</td></tr>
@endforeach
</table>
