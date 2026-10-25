// Test-only preload. Only reserved seo-fixture-* detail URLs are intercepted.
const originalFetch = globalThis.fetch
const fixtures = {
  events: { id: 99001, slug: 'seo-fixture-public', title: 'جلسة نمو الاختبار', description: 'تفاصيل عامة تظهر في HTML قبل تحميل JavaScript.', starts_at: '2027-03-01T15:00:00+03:00', is_public: true, visibility: 'public', status_flow: 'published', location: 'الرياض', requires_rsvp: false, invites: ['NEVER_SERIALIZE_THIS'], online_meeting_url: 'NEVER_SERIALIZE_THIS' },
  programs: { id: 99002, slug: 'seo-fixture-public', name: 'برنامج نمو الاختبار', title: 'برنامج نمو الاختبار', short_description: 'مقدمة البرنامج العامة.', full_description: 'محتوى البرنامج الذي يستطيع الزائر قراءته مباشرة.', visibility: 'public', status_flow: 'published', is_open: false, settings: { secret: 'NEVER_SERIALIZE_THIS' } },
}
globalThis.fetch = async (input, options) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
  const match = url.pathname.match(/^\/api\/v1\/(events|programs)\/(seo-fixture-(?:public|missing|outage|private))$/)
  if (!match) return originalFetch(input, options)
  const [, kind, slug] = match
  if (slug.endsWith('missing')) return Response.json({ message: 'Not found' }, { status: 404 })
  if (slug.endsWith('outage')) return Response.json({ message: 'Unavailable' }, { status: 503 })
  return Response.json({ data: { ...fixtures[kind], slug, ...(slug.endsWith('private') ? { visibility: 'members_only' } : {}) } })
}
