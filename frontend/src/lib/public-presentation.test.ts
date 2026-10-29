import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('home and founder discovery omit nonessential public instructions in both languages', () => {
  const home = read('../app/page.tsx')
  const founder = read('../components/sections/CommunityShowcase.tsx')
  for (const phrase of [
    'يراجع الفريق طلبات العضوية. لبرامج النمو مثل مسرّعة EO الرياض طلبات مستقلة.',
    'The team reviews membership applications.',
    'المواعيد والأماكن وطريقة التسجيل لكل لقاء.',
    'Dates, venues and how to register for each session.',
  ]) assert.ok(!home.includes(phrase), phrase)
  for (const phrase of [
    'اسحب أو استخدم الأسهم للاستكشاف',
    'Swipe or use the arrows to explore',
    'استكشف الملفات في شبكة مرتّبة مع صفحات',
    'Browse the full collection in a paginated grid',
  ]) assert.ok(!founder.includes(phrase), phrase)
  assert.match(founder, /aria-label=\{ar \? 'صف بطاقات المؤسسين/)
  assert.match(founder, /aria-expanded=\{gridOpen\}/)
  assert.match(home, /<UpcomingEvents/)
})

test('newsroom keeps news and region filtering but hides decorative numeric totals', () => {
  const page = read('../app/news/page.tsx')
  assert.match(page, /NEWS_REGIONS/)
  assert.match(page, /regionLabel\(value, locale\)/)
  assert.match(page, /categoryLabel\(value, locale\)/)
  assert.match(page, /const filtered = useMemo/)
  assert.doesNotMatch(page, /regionCounts|saudiLatest|count\(filtered.length\)/)
  assert.doesNotMatch(page, /\{count\(items.length\)\}|\{count\(regionCounts/)
  assert.doesNotMatch(page, /\$\{rest.length - shown.length\}/)
  assert.match(page, /<NewsCard/)
  assert.match(page, /collection.error/)
})

test('EO value and cohort cards retain the separately validated equal-height layout', () => {
  const css = read('../app/globals.css')
  const browser = read('../scripts/check-eoa-equal-cards.mjs')
  assert.match(css, /\.eoa-four-grid \{[^}]*grid-auto-rows:1fr;/)
  assert.match(css, /\.eoa-four-grid > \.eoa-pillar \{/)
  assert.match(browser, /EO value\/cohort card balance/)
  assert.match(browser, /scrollHeight <= g.clientHeight/)
})
