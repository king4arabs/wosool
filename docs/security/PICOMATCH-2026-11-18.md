# Picomatch build-tooling mitigation — 18 November 2026

## Decision

Keep `npm audit --audit-level=high` as a required backend gate and mitigate the vulnerable dependency rather than suppressing the advisory. Every backend build consumer resolves the checked-in package at `backend/vendor-node/picomatch-v4`.

The backend npm manifest uses a direct local dependency plus an override, while the pnpm workspace applies the same repository path to its complete graph. This keeps the independently deployed npm backend and the root pnpm workspace consistent.

The package is the MIT-licensed npm distribution of `picomatch` 4.0.7 (published tarball SHA-1 `6313360034ccb36b3dc61ecbdff78121f90fe21f`) with the focused `hasUnsafeLeadingQuantifier` change from the open upstream pull request. Its local version is `4.0.8-wosool.1` so the audit engine can distinguish the patched repository package from vulnerable upstream 4.0.7. It is not an upstream 4.0.8 release and must never be described as one.

## Verified boundary

- The [GitHub-reviewed advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) rates the issue high severity, covers official versions through 4.0.7 and lists no patched version.
- The [upstream releases](https://github.com/micromatch/picomatch/releases) still end at 4.0.7.
- [Upstream pull request #238](https://github.com/micromatch/picomatch/pull/238), commit `44f192261f312ddf236cb7bdc05d8f22663f98f9`, proposes the narrow guard used here. It remains open, so this repository does not imply upstream acceptance.
- The backend paths are development/build tooling: Vite, `tinyglobby`, `fdir` and `vite-plugin-full-reload`. Wosool does not pass public request values to these package instances.
- The older reload-plugin range is deliberately resolved to the patched v4 package. Its runtime API use is exercised by the Vite production build.

## Required verification

From `backend/`:

```bash
npm ci --ignore-scripts
npm run test:security-picomatch
npm audit --audit-level=high
npm run build
```

The regression test verifies the resolved package and version from both the root build graph and the reload plugin, asserts that unsafe repeated extglobs are literalized, and checks adversarial non-matches complete within one second. CI runs it for PHP 8.3, 8.4 and 8.5 before the unsuppressed audit.

Local acceptance on 18 November 2026: clean npm and frozen pnpm 11.24.0 installs passed; the dependency-path and adversarial-pattern regression passed under both package managers; npm audit reported zero vulnerabilities; Vite 8.3.3 built 59 modules successfully.

## Removal trigger

Replace the repository package when upstream publishes a release that:

1. is outside the advisory's affected range;
2. contains an equivalent reviewed repeated-extglob fix;
3. passes this repository's regression, audit and Vite build; and
4. does not change the accepted Hostinger frontend packaging baseline.

Remove the direct local dependency, the override and the vendored source in the same reviewed change. Keep or adapt the regression so a later dependency resolution cannot silently reintroduce the vulnerable pattern.

## Release boundary

This change affects repository and CI build tooling only. It does not deploy the Next.js frontend or Laravel backend, change Hostinger configuration, run a production migration, import founder/news data, modify review dates, or alter member and moderation records.
