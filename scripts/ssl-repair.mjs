#!/usr/bin/env node

/**
 * Wosool SSL Repair Script
 *
 * Repairs SSL certificate issues by ensuring the apex domain is proxied
 * through Cloudflare, enabling automatic certificate management.
 *
 * Prerequisites:
 *   - CLOUDFLARE_API_TOKEN: API token with Zone:DNS:Edit and Zone:SSL:Edit
 *   - CLOUDFLARE_ZONE_ID: Zone ID for the target domain
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ZONE_ID=yyy node scripts/ssl-repair.mjs
 *   or: npm run ops:ssl:repair
 */

const APEX_DOMAIN = 'mohammedalsolami.com';
const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

// ── Credential Validation ────────────────────────────────────────────

function validateCredentials() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const errors = [];

  if (!token || token.trim() === '' || token === 'your-api-token') {
    errors.push(
      'CLOUDFLARE_API_TOKEN is not set or is a placeholder.\n' +
      '  → Set it via: export CLOUDFLARE_API_TOKEN="your-actual-token"\n' +
      '  → Create a token at: https://dash.cloudflare.com/profile/api-tokens\n' +
      '  → Required permissions: Zone:DNS:Edit, Zone:SSL and Certificates:Edit'
    );
  }

  if (!zoneId || zoneId.trim() === '' || zoneId === 'your-zone-id') {
    errors.push(
      'CLOUDFLARE_ZONE_ID is not set or is a placeholder.\n' +
      '  → Set it via: export CLOUDFLARE_ZONE_ID="your-zone-id"\n' +
      '  → Find it in Cloudflare Dashboard → your domain → Overview (right sidebar)'
    );
  }

  if (errors.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════════════╗');
    console.error('║  SSL REPAIR: Missing Required Credentials                    ║');
    console.error('╚══════════════════════════════════════════════════════════════╝\n');
    errors.forEach((err, i) => {
      console.error(`  ${i + 1}. ${err}\n`);
    });
    console.error('See docs/SSL_RUNBOOK.md for full setup instructions.\n');
    process.exit(1);
  }

  return { token: token.trim(), zoneId: zoneId.trim() };
}

// ── Cloudflare API Helpers ───────────────────────────────────────────

async function cfFetch(token, path, options = {}) {
  const url = `${CF_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!data.success) {
    const errMessages = (data.errors || []).map(e => e.message).join(', ');
    throw new Error(`Cloudflare API error: ${errMessages || res.statusText}`);
  }

  return data;
}

// ── Main Repair Logic ────────────────────────────────────────────────

async function main() {
  console.log('\n🔧 Wosool SSL Repair Script');
  console.log('═'.repeat(50));
  console.log(`Target: ${APEX_DOMAIN} (apex domain)\n`);

  // Step 1: Validate credentials
  const { token, zoneId } = validateCredentials();
  console.log('✅ Credentials validated\n');

  // Step 2: Verify API token works
  console.log('📡 Verifying API token...');
  try {
    await cfFetch(token, '/user/tokens/verify');
    console.log('✅ API token is valid\n');
  } catch (err) {
    console.error('❌ API token verification failed:', err.message);
    console.error('   → Check that your token has not expired');
    console.error('   → Regenerate at: https://dash.cloudflare.com/profile/api-tokens\n');
    process.exit(1);
  }

  // Step 3: Find the apex A record
  console.log(`🔍 Looking up DNS records for ${APEX_DOMAIN}...`);
  const dnsData = await cfFetch(
    token,
    `/zones/${zoneId}/dns_records?type=A&name=${APEX_DOMAIN}`
  );

  const records = dnsData.result || [];
  if (records.length === 0) {
    console.error(`❌ No A record found for ${APEX_DOMAIN}`);
    console.error('   → Verify the zone ID is correct');
    console.error('   → Check DNS records in Cloudflare Dashboard\n');
    process.exit(1);
  }

  const record = records[0];
  console.log(`   Found: ${record.name} → ${record.content} (proxied: ${record.proxied})\n`);

  // Step 4: Check if already proxied
  if (record.proxied) {
    console.log('✅ Apex domain is already proxied through Cloudflare.');
    console.log('   SSL should be automatically managed.');
    console.log('   If the certificate is still invalid, check:');
    console.log('   1. SSL/TLS mode is "Full (Strict)" in Cloudflare');
    console.log('   2. Universal SSL is enabled under Edge Certificates');
    console.log('   3. Wait 5–15 minutes for propagation\n');
    process.exit(0);
  }

  // Step 5: Enable proxy
  console.log('🔄 Enabling Cloudflare proxy for apex domain...');
  await cfFetch(
    token,
    `/zones/${zoneId}/dns_records/${record.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ proxied: true }),
    }
  );
  console.log('✅ Proxy enabled for apex domain\n');

  // Step 6: Verify
  console.log('🔍 Verifying change...');
  const verifyData = await cfFetch(
    token,
    `/zones/${zoneId}/dns_records/${record.id}`
  );

  if (verifyData.result.proxied) {
    console.log('✅ Verified: Apex domain is now proxied through Cloudflare');
    console.log('\n📋 Next steps:');
    console.log('   1. Wait 5–15 minutes for DNS and SSL propagation');
    console.log('   2. Verify with: curl -sI https://mohammedalsolami.com | head -1');
    console.log('   3. Check certificate: echo | openssl s_client -servername mohammedalsolami.com -connect mohammedalsolami.com:443 2>/dev/null | openssl x509 -noout -dates');
    console.log('\n   See docs/SSL_RUNBOOK.md for full validation steps.\n');
  } else {
    console.error('⚠️  Change applied but verification shows proxy is not enabled.');
    console.error('   → This may be a propagation delay. Retry in a few minutes.');
    console.error('   → Or check Cloudflare Dashboard manually.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n❌ Unexpected error:', err.message);
  console.error('   See docs/SSL_RUNBOOK.md for manual repair steps.\n');
  process.exit(1);
});
