@props(['rows' => [], 'lang' => 'en', 'dir' => 'ltr'])

@foreach ($rows as $row)
{{ $row[$lang] }}: {{ $row['value'] }}
@endforeach

