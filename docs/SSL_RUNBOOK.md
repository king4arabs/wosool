# SSL Runbook

> Operational procedures for SSL/TLS and DNS management on wosool.org.

---

## Overview

Wosool uses **Cloudflare** as its DNS and SSL/TLS provider. The apex domain
(`wosool.org`) and API subdomain (`api.wosool.org`) are both proxied through
Cloudflare with **Full (Strict)** SSL mode enabled.

| Domain | Purpose | Proxy | SSL |
|--------|---------|-------|-----|
| wosool.org | Frontend (production) | ✅ Orange-clouded | Full Strict |
| api.wosool.org | Backend API | ✅ Orange-clouded | Full Strict |

---

## Prerequisites

You need two environment variables to run any automated repair:

| Variable | Where to find it |
|----------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Zone:SSL, Zone:DNS permissions) |
| `CLOUDFLARE_ZONE_ID` | Cloudflare Dashboard → wosool.org → Overview → right sidebar |

> **Security:** Never commit these values to source control. Use a `.env` file
> or your CI/CD secrets store.

---

## Quick Diagnosis

### Check SSL certificate from the command line

```bash
# Verify certificate and expiry
curl -vI https://wosool.org 2>&1 | grep -i "ssl\|certificate\|expire\|issuer"

# Check API subdomain
curl -vI https://api.wosool.org 2>&1 | grep -i "ssl\|certificate\|expire\|issuer"
```

### Check via OpenSSL

```bash
echo | openssl s_client -connect wosool.org:443 -servername wosool.org 2>/dev/null \
  | openssl x509 -noout -dates -issuer -subject
```

### Expected healthy output

- **Issuer:** Cloudflare Inc (or Google Trust Services via Cloudflare)
- **Not After:** at least 14 days in the future
- **Subject:** covers `wosool.org` and `*.wosool.org`

---

## Automated Repair

The SSL repair script verifies and corrects four settings via the Cloudflare API:

1. SSL/TLS mode is **full** or **strict**
2. DNS records for `wosool.org` and `api.wosool.org` are **proxied** (orange-clouded)
3. **Always Use HTTPS** is enabled
4. A Universal SSL certificate pack is **active**

### Running the script

```bash
# Set credentials
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"

# Run via npm (from repository root)
npm run ops:ssl:repair

# Or directly
node scripts/ssl-repair.mjs
```

The script will exit with code `1` if credentials are missing or if a fatal
Cloudflare API error occurs.

---

## Manual Repair Procedures

### SSL mode is not Full Strict

1. Go to Cloudflare Dashboard → wosool.org → **SSL/TLS** → Overview
2. Set encryption mode to **Full (Strict)**
3. Wait up to 5 minutes for propagation

### DNS record is not proxied

1. Cloudflare Dashboard → wosool.org → **DNS** → Records
2. Find the A/CNAME record for the affected domain
3. Click the grey cloud icon to toggle it to **orange** (proxied)
4. Save

### Certificate expired or missing

1. Cloudflare Dashboard → SSL/TLS → **Edge Certificates**
2. Check "Universal SSL" status — it should say **Active**
3. If disabled, click **Enable Universal SSL**
4. Cloudflare will provision a new certificate within 15 minutes

### ERR_SSL_VERSION_OR_CIPHER_MISMATCH

This usually means the DNS record is not proxied (grey-clouded) and the origin
server does not have a valid certificate. Fix by proxying the record through
Cloudflare (see above).

---

## Monitoring

| Check | Tool | Frequency |
|-------|------|-----------|
| SSL expiry | UptimeRobot / Cloudflare | Daily (automated) |
| HTTPS redirect | curl smoke test | On deploy |
| DNS propagation | `dig wosool.org` | On DNS changes |
| Certificate transparency | crt.sh | Weekly |

### Recommended UptimeRobot setup

- Monitor `https://wosool.org` — HTTP(S), keyword "Wosool"
- Monitor `https://api.wosool.org/api/v1/health` — HTTP(S), status 200
- Alert contacts: Platform Lead, DevOps

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Browser shows "Not Secure" | SSL mode set to Off or Flexible | Set to Full (Strict) |
| ERR_TOO_MANY_REDIRECTS | SSL mode is Flexible while origin forces HTTPS | Set to Full (Strict) |
| 525 SSL Handshake Failed | Origin cert invalid or expired | Install valid origin cert or use Cloudflare Origin CA |
| 526 Invalid SSL Certificate | Origin cert not trusted | Use Cloudflare Origin CA certificate |
| Mixed content warnings | HTTP resources on HTTPS page | Update asset URLs to HTTPS |

---

## Related Documents

- [Operations](../OPERATIONS.md) — Operational runbooks
- [Deployment](../DEPLOYMENT.md) — Deployment and SSL configuration
- [Security](../SECURITY.md) — Security policies
