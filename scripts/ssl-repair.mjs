#!/usr/bin/env node

/**
 * SSL Certificate Repair Script for wosool.org
 *
 * Uses the Cloudflare API to verify and repair SSL/TLS settings
 * for the apex domain (wosool.org) and API subdomain (api.wosool.org).
 *
 * Required environment variables:
 *   CLOUDFLARE_API_TOKEN  — Cloudflare API token with Zone:SSL and Zone:DNS permissions
 *   CLOUDFLARE_ZONE_ID    — Zone ID for wosool.org (found in Cloudflare dashboard → Overview)
 *
 * Usage:
 *   node scripts/ssl-repair.mjs
 *   # or via npm:
 *   npm run ops:ssl:repair
 *
 * Reference: docs/SSL_RUNBOOK.md
 */

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

// ---------------------------------------------------------------------------
// Guard: ensure credentials are present before making any API calls
// ---------------------------------------------------------------------------
const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!token || !zoneId) {
  console.error(
    "❌  Missing required environment variables.\n" +
      "    Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID before running this script.\n" +
      "    See docs/SSL_RUNBOOK.md for details."
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function cfFetch(path, options = {}) {
  const url = `${CLOUDFLARE_API}/zones/${zoneId}${path}`;
  const res = await fetch(url, { ...options, headers });
  const json = await res.json();
  if (!json.success) {
    const msgs = (json.errors || []).map((e) => e.message).join("; ");
    throw new Error(`Cloudflare API error: ${msgs}`);
  }
  return json.result;
}

function log(icon, msg) {
  console.log(`${icon}  ${msg}`);
}

// ---------------------------------------------------------------------------
// 1. Verify SSL/TLS mode
// ---------------------------------------------------------------------------
async function verifySSLMode() {
  log("🔍", "Checking SSL/TLS mode…");
  const settings = await cfFetch("/settings/ssl");
  const mode = settings.value;
  log("📋", `Current SSL mode: ${mode}`);

  if (mode === "full" || mode === "strict") {
    log("✅", "SSL mode is acceptable (full or strict).");
    return;
  }

  log("⚠️", `SSL mode "${mode}" is not recommended. Setting to "full"…`);
  await cfFetch("/settings/ssl", {
    method: "PATCH",
    body: JSON.stringify({ value: "full" }),
  });
  log("✅", "SSL mode set to full.");
}

// ---------------------------------------------------------------------------
// 2. Verify DNS records are proxied (orange-clouded)
// ---------------------------------------------------------------------------
async function verifyDNSProxy() {
  log("🔍", "Checking DNS records…");
  const records = await cfFetch("/dns_records?per_page=100");

  const critical = ["wosool.org", "api.wosool.org"];
  for (const name of critical) {
    const rec = records.find((r) => r.name === name && (r.type === "A" || r.type === "CNAME"));
    if (!rec) {
      log("⚠️", `No A/CNAME record found for ${name}. Please create one in the Cloudflare dashboard.`);
      continue;
    }
    if (rec.proxied) {
      log("✅", `${name} is proxied (orange-clouded).`);
    } else {
      log("⚠️", `${name} is DNS-only. Enabling Cloudflare proxy…`);
      await cfFetch(`/dns_records/${rec.id}`, {
        method: "PATCH",
        body: JSON.stringify({ proxied: true }),
      });
      log("✅", `${name} is now proxied.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Verify HTTPS is enforced (Always Use HTTPS)
// ---------------------------------------------------------------------------
async function verifyAlwaysHTTPS() {
  log("🔍", "Checking Always Use HTTPS setting…");
  const setting = await cfFetch("/settings/always_use_https");

  if (setting.value === "on") {
    log("✅", "Always Use HTTPS is enabled.");
    return;
  }

  log("⚠️", "Always Use HTTPS is off. Enabling…");
  await cfFetch("/settings/always_use_https", {
    method: "PATCH",
    body: JSON.stringify({ value: "on" }),
  });
  log("✅", "Always Use HTTPS is now enabled.");
}

// ---------------------------------------------------------------------------
// 4. Check Universal SSL certificate status
// ---------------------------------------------------------------------------
async function checkCertificate() {
  log("🔍", "Checking Universal SSL certificate status…");
  try {
    const pack = await cfFetch("/ssl/certificate_packs?status=active");
    if (Array.isArray(pack) && pack.length > 0) {
      log("✅", `Active certificate pack found (${pack.length} pack(s)).`);
    } else {
      log("⚠️", "No active certificate pack. Cloudflare may be provisioning one — check the dashboard.");
    }
  } catch {
    log("⚠️", "Could not retrieve certificate packs. Verify permissions on your API token.");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   Wosool SSL / DNS Repair — wosool.org      ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  try {
    await verifySSLMode();
    await verifyDNSProxy();
    await verifyAlwaysHTTPS();
    await checkCertificate();

    console.log("\n🎉  SSL/DNS health check complete.");
  } catch (err) {
    console.error(`\n❌  Fatal error: ${err.message}`);
    process.exit(1);
  }
}

main();
