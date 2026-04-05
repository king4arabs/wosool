# Wosool — SSL/TLS Runbook

## Current Status

| Domain | Certificate Status | Proxy | Notes |
|--------|--------------------|-------|-------|
| `www.mohammedalsolami.com` | ✅ Valid (through July 2026) | Cloudflare | Proxied, auto-renewed |
| `mohammedalsolami.com` (apex) | ❌ Expired (October 28, 2024) | **Bypasses Cloudflare** | Requires manual intervention |

## Root Cause

The **apex domain** (`mohammedalsolami.com`) does not route through the Cloudflare proxy, so Cloudflare's automatic certificate management does not cover it. The `www` subdomain is properly proxied and has a valid certificate.

### Why This Happens

1. DNS for the apex domain uses a direct A record (not proxied through Cloudflare)
2. Cloudflare's Universal SSL only covers domains routed through their proxy (orange cloud)
3. The apex domain resolves directly to the origin server, which serves an expired certificate

## Repair Procedure

### Prerequisites

You **must** have the following before attempting repair:

1. **Cloudflare API Token** with Zone:DNS:Edit and Zone:SSL:Edit permissions
2. **Cloudflare Zone ID** for the target domain
3. **Cloudflare Account ID**

⚠️ **Do NOT hardcode credentials.** Store them in environment variables or a `.env` file that is gitignored.

### Option A: Fix via Cloudflare Dashboard (Recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select the domain zone
3. Go to **DNS** → **Records**
4. Find the A record for `mohammedalsolami.com` (apex)
5. Click **Edit** and toggle the **Proxy status** to **Proxied** (orange cloud ☁️)
6. Save the record
7. Go to **SSL/TLS** → **Overview**
8. Ensure SSL mode is **Full (Strict)**
9. Go to **SSL/TLS** → **Edge Certificates**
10. Verify Universal SSL covers both apex and www
11. Wait 5–15 minutes for propagation

### Option B: Fix via Script

```bash
# Set required environment variables
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"

# Run the repair script
npm run ops:ssl:repair
# or directly:
node scripts/ssl-repair.mjs
```

The script will:
1. Validate that required credentials are set
2. Check current DNS proxy status for the apex domain
3. Enable Cloudflare proxy for the apex A record if not already proxied
4. Verify SSL certificate status

### Option C: Manual API Repair

If the script is unavailable, use the Cloudflare API directly:

```bash
# 1. List DNS records to find the apex A record ID
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?type=A&name=mohammedalsolami.com" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json"

# 2. Update the record to enable proxy (replace RECORD_ID with actual ID)
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"proxied": true}'
```

## Validation

After repair, verify both domains serve valid certificates:

```bash
# Check apex domain
echo | openssl s_client -servername mohammedalsolami.com -connect mohammedalsolami.com:443 2>/dev/null | openssl x509 -noout -dates

# Check www
echo | openssl s_client -servername www.mohammedalsolami.com -connect www.mohammedalsolami.com:443 2>/dev/null | openssl x509 -noout -dates

# Quick check (should show 200, not certificate error)
curl -sI https://mohammedalsolami.com | head -1
curl -sI https://www.mohammedalsolami.com | head -1
```

## Prevention

To prevent this from recurring:

1. **Always proxy the apex domain through Cloudflare** (orange cloud enabled)
2. **Set up monitoring** for certificate expiry on both apex and www
3. **Consider adding a Page Rule** or redirect rule: `mohammedalsolami.com/*` → `https://www.mohammedalsolami.com/$1`
4. **Document DNS changes** — any change to the apex A record must preserve proxy status

## Blocking Dependencies

The SSL certificate **cannot be repaired from repo-only changes**. The actual fix requires:

1. Access to the Cloudflare account managing the domain
2. A valid Cloudflare API token with DNS and SSL permissions
3. Network access to the Cloudflare API

The `scripts/ssl-repair.mjs` script automates the API calls but **cannot function without valid Cloudflare credentials**.

## Apex vs. WWW: Key Differences

| Aspect | Apex (`mohammedalsolami.com`) | WWW (`www.mohammedalsolami.com`) |
|--------|-------------------------------|----------------------------------|
| DNS Record | A record | CNAME record |
| Cloudflare Proxy | ❌ Currently bypassed | ✅ Proxied |
| SSL Certificate | ❌ Expired | ✅ Valid |
| Auto-renewal | ❌ No (not proxied) | ✅ Yes (Cloudflare managed) |

## Emergency Contact

If the SSL repair script fails or you lack credentials, contact the infrastructure owner with:
- The domain name and zone
- The specific error message from the script
- Whether this is apex-only or affects www too
