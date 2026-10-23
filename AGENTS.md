# Repository instructions

## Preserve the working Hostinger deployment baseline

The owner confirmed on 23 October 2026 that wosool.org is working. For future deployment work, preserve the runtime-dependency solution introduced in commit a7be83042c315fe436f2e7b13dd4cc11243134c4 ("Fix Hostinger standalone runtime dependencies"). This is the accepted baseline; the owner's availability confirmation does not independently identify the active hosting SHA.

- Keep `frontend/.npmrc` with `node-linker=hoisted`.
- Preserve `outputFileTracingIncludes["/*"]` in `frontend/next.config.ts` for `@swc/helpers`, `react`, and `react-dom`. Hostinger packages the traced runtime separately; these packages must remain available as real runtime files.
- Keep `@swc/helpers` as a direct production dependency (baseline version `0.5.23`). Dependency upgrades must retain the packaging behavior and synchronize the applicable npm and pnpm locks, including both pnpm lockfiles.
- Follow `DEPLOYMENT.md`: Hostinger app root `frontend`, Next.js, Node 22.x, pnpm 11.24.0, `pnpm run build`, output `.next`, and the managed Node server. Preserve the webpack build wrapper and one-worker build limits.
- Preserve required production build values: `NEXT_PUBLIC_SITE_URL=https://wosool.org`, `NEXT_PUBLIC_API_URL=https://api.wosool.org`, and `NEXT_PUBLIC_ENABLE_DEMO_CONTENT=false`.
- Keep the Laravel API at `api.wosool.org` separate from the frontend.

Do not replace this deployment approach during unrelated feature or design work. Any necessary change to it must explain the reason, validate a clean frontend-only install and packaged runtime, and retain a rollback artifact. Follow the existing CI and deployment verification procedures; test live `/`, `/eoa`, `/health`, and served JavaScript/CSS after an actual release. Use the production smoke script for API readiness and proxy checks. Record the deployed SHA and results; distinguish owner-reported availability from independently verified checks.

Read `DEPLOYMENT.md` before deployment changes. Keep these instructions current when an intentionally validated replacement baseline is adopted.

## Public interface copy

Keep internal editorial, AI-generation, source-collection and review-process notes out of public UI in both Arabic and English. Use concise product copy instead. Do not render internal review dates or review-due badges on public cards. Preserve useful business facts, source links, image credits, accurate membership/verification state, and functional error or eligibility guidance.
