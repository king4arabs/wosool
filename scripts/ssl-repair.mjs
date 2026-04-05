#!/usr/bin/env node

const args = new Set(process.argv.slice(2))
const apexDomain = process.env.APEX_DOMAIN ?? process.env.DOMAIN
const wwwDomain = process.env.WWW_DOMAIN ?? (apexDomain ? `www.${apexDomain}` : undefined)
const applyChanges = args.has('--apply')

const requiredEnv = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID']
const missingEnv = requiredEnv.filter((name) => !process.env[name])

function fail(message) {
  console.error(`\n[ssl-repair] ${message}\n`)
  process.exit(1)
}

function validateDomain(domain, label) {
  if (!domain) {
    fail(`${label} is required. Set DOMAIN or APEX_DOMAIN${label === 'www domain' ? ' / WWW_DOMAIN' : ''}.`)
  }

  if (domain !== domain.trim() || domain.includes('://') || domain.includes('/')) {
    fail(`${label} must be a bare hostname without protocol or path: received "${domain}".`)
  }
}

validateDomain(apexDomain, 'apex domain')
validateDomain(wwwDomain, 'www domain')

if (apexDomain.startsWith('www.')) {
  fail(`APEX_DOMAIN must be the root hostname, not the www host: received "${apexDomain}".`)
}

if (wwwDomain === apexDomain) {
  fail('www domain must be different from apex domain.')
}

if (!wwwDomain.startsWith('www.')) {
  fail(`WWW_DOMAIN must start with "www.": received "${wwwDomain}".`)
}

if (missingEnv.length > 0) {
  fail(
    [
      `Missing Cloudflare credentials: ${missingEnv.join(', ')}.`,
      'Export the required variables and retry.',
      `Example: DOMAIN=${apexDomain} CLOUDFLARE_API_TOKEN=*** CLOUDFLARE_ZONE_ID=*** npm run ops:ssl:repair -- --apply`,
    ].join(' ')
  )
}

const token = process.env.CLOUDFLARE_API_TOKEN
const zoneId = process.env.CLOUDFLARE_ZONE_ID

async function cf(path, options = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  const payload = await response.json()

  if (!response.ok || payload.success === false) {
    const errors = payload.errors?.map((error) => error.message).join('; ') || response.statusText
    throw new Error(`Cloudflare API request failed (${response.status}): ${errors}`)
  }

  return payload.result
}

async function getDnsRecords(name) {
  return cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}`)
}

async function patchRecord(record) {
  return cf(`/zones/${zoneId}/dns_records/${record.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ proxied: true }),
  })
}

function printRecords(hostname, records) {
  console.log(`\n[ssl-repair] ${hostname}`)

  if (records.length === 0) {
    console.log('  - no DNS records found')
    return
  }

  for (const record of records) {
    console.log(
      `  - ${record.type} ${record.name} -> ${record.content} | proxied=${record.proxied ?? 'n/a'} | ttl=${record.ttl}`
    )
  }
}

function getProxyCandidates(records) {
  return records.filter((record) => ['A', 'AAAA', 'CNAME'].includes(record.type))
}

function getUnproxiedRecords(records) {
  return getProxyCandidates(records).filter((record) => record.proxied !== true)
}

async function ensureProxied(hostname, records) {
  const proxyable = getProxyCandidates(records)

  if (proxyable.length === 0) {
    fail(`${hostname} does not have a proxyable A, AAAA, or CNAME record in Cloudflare.`)
  }

  const unproxied = getUnproxiedRecords(records)

  if (unproxied.length === 0) {
    console.log(`[ssl-repair] ${hostname} is already proxied through Cloudflare.`)
    return
  }

  if (!applyChanges) {
    console.log(`[ssl-repair] ${hostname} has ${unproxied.length} DNS-only record(s). Re-run with --apply to proxy them.`)
    return
  }

  for (const record of unproxied) {
    await patchRecord(record)
    console.log(`[ssl-repair] Enabled Cloudflare proxy on ${record.type} ${record.name}.`)
  }
}

async function main() {
  console.log(`[ssl-repair] Inspecting apex=${apexDomain} and www=${wwwDomain}.`)
  console.log(`[ssl-repair] Mode: ${applyChanges ? 'apply' : 'dry-run'}.`)

  const [apexRecords, wwwRecords] = await Promise.all([getDnsRecords(apexDomain), getDnsRecords(wwwDomain)])

  printRecords(apexDomain, apexRecords)
  printRecords(wwwDomain, wwwRecords)

  if (apexRecords.length === 0) {
    fail(`No DNS records found for apex host "${apexDomain}".`)
  }

  if (wwwRecords.length === 0) {
    fail(`No DNS records found for www host "${wwwDomain}".`)
  }

  await ensureProxied(apexDomain, apexRecords)
  await ensureProxied(wwwDomain, wwwRecords)

  console.log('\n[ssl-repair] Next steps:')
  console.log(`  1. Verify both https://${apexDomain} and https://${wwwDomain} present the expected certificate.`)
  console.log(`  2. Confirm the apex host is orange-cloud proxied in Cloudflare and not bypassing the CDN.`)
  console.log('  3. If the certificate is still stale after proxying, purge edge cache / re-issue SSL from your hosting control plane.')
}

main().catch((error) => fail(error.message))
