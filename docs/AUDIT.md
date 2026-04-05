# Audit

## Scope

This audit covers the repository state that was verifiable from source plus local dependency inspection.

## Documentation findings

- The root `README.md` now links to repository-relative documentation paths only.
- No hardcoded local machine paths remain in the updated root documentation.

## Dependency findings

### Frontend npm audit

Commands run:

```bash
cd frontend
npm audit --json
npm audit --omit=dev --json
npm ls @tootallnate/once nth-check
```

Result:

- `npm audit` reported `0` vulnerabilities in the current lockfile
- `@tootallnate/once` is not present in the installed dependency tree
- `nth-check` is not present in the installed dependency tree

### Optional peer dependency note

- `@types/react` and `@types/react-dom` are already installed as dev dependencies
- `encoding`, `bufferutil`, and `utf-8-validate` are not required by the current application path and were not needed to build or lint the frontend
- No extra packages were added because the current tree does not require them for production behavior

## Validation findings

- Frontend lint completed with warnings only for pre-existing unused imports
- Frontend production build completed successfully
- Backend tests require a generated Laravel app key when run locally; CI already handles this with `cp .env.example .env` and `php artisan key:generate`

## Risk summary

- Current frontend risk is low based on the audited dependency tree
- SSL remediation remains operationally dependent on valid Cloudflare credentials and DNS access; see [SSL_RUNBOOK.md](./SSL_RUNBOOK.md)
