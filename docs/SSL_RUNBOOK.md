# SSL Runbook

## Problem this runbook addresses

If the apex host serves an expired or stale certificate while `www` remains valid, the usual root cause is that the apex DNS record is bypassing Cloudflare proxying while the `www` record still routes through Cloudflare.

## Guardrails

- Treat the apex host and `www` host as separate checks
- Do not assume fixing `www` fixes the apex host
- Do not run repair steps without a Cloudflare API token and zone ID
- Do not hardcode tokens, record IDs, or credentials in the repository

## Repository command

Dry-run inspection:

```bash
DOMAIN=example.com \
CLOUDFLARE_API_TOKEN=*** \
CLOUDFLARE_ZONE_ID=*** \
npm run ops:ssl:repair
```

Apply Cloudflare proxy changes:

```bash
DOMAIN=example.com \
CLOUDFLARE_API_TOKEN=*** \
CLOUDFLARE_ZONE_ID=*** \
npm run ops:ssl:repair -- --apply
```

You may also pass explicit hostnames:

```bash
APEX_DOMAIN=example.com \
WWW_DOMAIN=www.example.com \
CLOUDFLARE_API_TOKEN=*** \
CLOUDFLARE_ZONE_ID=*** \
npm run ops:ssl:repair -- --apply
```

## What the script does

`scripts/ssl-repair.mjs`:

1. validates that the apex hostname is not accidentally set to `www`
2. validates that Cloudflare credentials are present
3. inspects both apex and `www` DNS records in Cloudflare
4. reports whether each record is proxied
5. enables proxying for unproxied `A`, `AAAA`, or `CNAME` records only when `--apply` is provided

## Manual validation

After proxy changes, verify both hosts separately:

```bash
curl -Iv https://example.com
curl -Iv https://www.example.com
openssl s_client -connect example.com:443 -servername example.com </dev/null | openssl x509 -noout -dates -subject
openssl s_client -connect www.example.com:443 -servername www.example.com </dev/null | openssl x509 -noout -dates -subject
```

## Blocking dependency

The repository can make the repair path safer, but it cannot repair a live certificate by itself.

External access is still required for:

- a valid `CLOUDFLARE_API_TOKEN`
- the correct `CLOUDFLARE_ZONE_ID`
- permission to inspect and update the zone's DNS records
- any hosting-platform SSL re-issue action if the origin or edge certificate remains stale after DNS is corrected

## Incident checklist

- [ ] Confirm the failing hostname is the apex host
- [ ] Confirm the `www` host behavior separately
- [ ] Run the repo dry-run command
- [ ] Apply proxy changes if the apex record is DNS-only
- [ ] Re-check certificate dates on both hosts
- [ ] Escalate to hosting/origin SSL re-issue only if the proxy state is correct and the certificate is still stale
