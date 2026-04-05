# Wosool — Dependency Vulnerability Audit

> Last updated: 2026-04-05

## Summary

| Finding | Applicable? | Status |
|---------|-------------|--------|
| `@tootallnate/once` (GHSA-vpq2-c234-7xj6) | ❌ No | Not in dependency tree |
| `nth-check` (GHSA-rp65-9cf3-cjxr) | ❌ No | Not in dependency tree |
| Optional peer dep warnings | ℹ️ Informational | Non-blocking, no action needed |

## Detailed Analysis

### @tootallnate/once — Incorrect Control Flow Scoping

- **Advisory:** [GHSA-vpq2-c234-7xj6](https://github.com/advisories/GHSA-vpq2-c234-7xj6)
- **Severity:** Medium
- **Transitive path:** `jest` → `jest-environment-jsdom` → `jsdom` → `http-proxy-agent` → `agent-base` → `@tootallnate/once`
- **Applicable to Wosool:** **No**
- **Reason:** This project does not use `jest` or `react-scripts`. The frontend uses ESLint for linting and Next.js 16 for building. Neither `jest` nor `@tootallnate/once` appear in `frontend/package-lock.json`.

### nth-check — Inefficient Regular Expression Complexity

- **Advisory:** [GHSA-rp65-9cf3-cjxr](https://github.com/advisories/GHSA-rp65-9cf3-cjxr)
- **Severity:** High
- **Transitive path:** `react-scripts` → `@svgr/webpack` → `@svgr/plugin-svgo` → `svgo` → `css-select` → `nth-check`
- **Applicable to Wosool:** **No**
- **Reason:** This project does not use `react-scripts` (Create React App). The frontend is built with Next.js 16. Neither `react-scripts`, `svgo`, nor `nth-check` appear in `frontend/package-lock.json`.

### Why These Were Flagged

These vulnerabilities were likely identified during a generic security audit that assumed the project uses Create React App (`react-scripts`) and Jest for testing. The Wosool project was built with **Next.js 16** and uses **ESLint** for validation, so these dependency chains do not exist in the project.

## Optional Peer Dependencies

The following warnings may appear during `npm install`:

| Package | Context | Required? | Impact if Missing |
|---------|---------|-----------|-------------------|
| `encoding` | Optional dep of `node-fetch` | No | Only needed for non-UTF-8 text decoding |
| `bufferutil` | Optional dep of `ws` | No | Minor perf optimization for WebSocket binary data |
| `utf-8-validate` | Optional dep of `ws` | No | Minor perf optimization for WebSocket validation |

**These are non-blocking.** They produce warnings but do not affect build, test, or runtime behavior. Installing them would add native compilation dependencies (node-gyp) with no meaningful benefit for this project.

**Recommendation:** Ignore these warnings. Do not add them to `package.json`.

## Remediation Path (If Vulnerabilities Were Applicable)

If the project ever adds `jest` or `react-scripts`:

1. **Preferred:** Use `npm overrides` in `package.json` to pin safe versions:
   ```json
   {
     "overrides": {
       "@tootallnate/once": ">=2.0.0",
       "nth-check": ">=2.0.1"
     }
   }
   ```

2. **Alternative:** Upgrade the upstream package (e.g., `jest@30+`, `react-scripts@6+`) which resolves the transitive chain.

3. **If no fix is available:** Document in this file and accept the risk with a clear note on scope (build-time only, dev-only, or runtime).

## Risk Assessment

| Scope | Risk |
|-------|------|
| Production runtime | **None** — no vulnerable packages in dependency tree |
| Build time | **None** — no vulnerable packages in dependency tree |
| Development | **None** — no vulnerable packages in dependency tree |
