import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import companyLogos from '../data/company-logos.json'
import { reviewedCompanyLogo, brandLogoSource, brandLogoNeedsDarkSurface } from './brand-logos'

test('reviewed company brands match exact canonical hosts, including legacy API records without logos', () => {
  assert.equal(reviewedCompanyLogo('https://www.zid.sa/en/'), '/company-logos/zid.svg')
  assert.equal(reviewedCompanyLogo('https://zid.sa/'), '/company-logos/zid.svg')
  assert.equal(reviewedCompanyLogo('https://zid.sa.example.com'), undefined)
  assert.equal(reviewedCompanyLogo('javascript:alert(1)'), undefined)
  assert.equal(reviewedCompanyLogo(undefined), undefined)
  assert.equal(brandLogoSource('/storage/member-upload.png'), '/storage/member-upload.png')
  assert.equal(brandLogoNeedsDarkSurface(undefined, 'https://zid.sa'), true)
  assert.equal(brandLogoNeedsDarkSurface('/storage/member-upload.png', 'https://zid.sa'), false)
})

test('reviewed company artwork is local, safe, unique by host and available for every registry entry', () => {
  const hosts = companyLogos.map(logo => new URL(logo.website).hostname.replace(/^www\./, ''))
  assert.equal(new Set(hosts).size, hosts.length)
  assert.ok(companyLogos.length >= 150)
  for (const logo of companyLogos) {
    assert.match(logo.src, /^\/(company-logos|startup-directory)\/[a-z0-9-]+\.(svg|png|webp|ico|jpg)$/)
    const file = new URL('../../public' + logo.src, import.meta.url)
    assert.ok(existsSync(file), logo.company_key)
    if (logo.src.endsWith('.svg')) assert.doesNotMatch(readFileSync(file, 'utf8'), /<script|<foreignObject|(?:href|src)\s*=\s*["'](?:https?:|\/\/|javascript:)|\son[a-z]+\s*=/i)
  }
})
