# Dependency audit

Last reviewed: **23 October 2026**. Exact package versions are recorded in the committed npm, pnpm and Composer lockfiles; manifest ranges are not an installed-version inventory.

| Scope | Result | Evidence |
| --- | --- | --- |
| Frontend production dependencies | No reported vulnerabilities | `npm audit --omit=dev --audit-level=high` passed in PR #93 CI |
| Frontend including development tools | 5 high-severity dependency entries, all tracing to one advisory | Full `npm audit --json` on 23 October 2026 |
| Backend PHP dependencies | No reported advisories | `composer audit` passed on PHP 8.3.36, 8.4.27 and 8.5.12 in PR #93 CI |
| Backend asset-build dependencies | Audit passed | `npm audit --audit-level=high` in PR #93 CI |

## Open development-tool advisory

[`GHSA-vfj7-8cjw-p6xm`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), CVE-2026-93687, affects `braces` through 3.0.3. Deeply nested brace patterns can exhaust the call stack. The upstream advisory lists **no patched version** as of this review.

The installed development-only chain is:

`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`.

The five npm findings describe that chain, not five distinct vulnerabilities. This dependency is not in the frontend production dependency set. Repository lint settings use checked-in patterns; do not run lint tooling as a public service accepting untrusted patterns. CI runs in isolated workers without production secrets.

npm proposes downgrading `eslint-config-next` to 14.2.35, a breaking change from the project's Next.js 16 toolchain. That downgrade has not been applied. No audit ignore or suppression is added. Recheck for a compatible upstream patch and update both frontend lockfiles and the root pnpm lock together when one is available.

## Release verification

```bash
npm --prefix frontend audit --omit=dev --audit-level=high
npm --prefix frontend audit
composer --working-dir=backend audit
npm --prefix backend audit --audit-level=high
```

The full frontend audit currently exits nonzero for the development advisory above. A clean production dependency audit does not prove application security, patched hosting runtimes, mail delivery or a successful deployment.

The application uses Next.js 16.4.2 and React 19.2.4. Hosting installs are pinned to pnpm 11.24.0. Verify the actual Node.js and PHP serving processes separately using [DEPLOYMENT.md](../DEPLOYMENT.md); updating npm packages cannot patch the runtime itself.

[PR #93](https://github.com/king4arabs/wosool/pull/93) adds mandatory release-environment validation, clean standalone pnpm build/start checks, JavaScript/CSS delivery checks, and Laravel deployment-cache compilation. It does not establish that Hostinger has activated the revision.
