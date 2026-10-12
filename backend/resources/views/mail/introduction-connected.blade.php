<x-mail::message>
# تم الربط | You're connected

مرحباً {{ $recipientName }}،

تم قبول طلب التعريف، وأصبحت الآن على تواصل مع {{ $counterpartName }}. يمكنك متابعة المحادثة مباشرة عبر رسائل المنصة.

Hello {{ $recipientName }},

Your introduction was accepted — you are now connected with {{ $counterpartName }}. Continue the conversation directly in Wosool messages.

<x-mail::button :url="$actionUrl">
فتح الرسائل | Open messages
</x-mail::button>

وصول | Wosool
</x-mail::message>
