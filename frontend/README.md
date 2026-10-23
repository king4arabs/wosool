# Wosool Frontend

The frontend is a **Next.js 16 + React 19** application for Wosool's public site, member dashboard, and admin surfaces.

## Development

```bash
npm ci
cp .env.example .env.local
npm run lint
npm run dev
```

The app expects the Laravel backend to be available for live API-backed routes such as authentication, profile management, event RSVP, and program applications.
For local development, the backend defaults to SQLite; run `npm run setup` at the repository root before starting both services. The Cairo and Roboto fonts are bundled locally, so production builds do not need access to Google Fonts.

## Hostinger release

Use the `frontend` root, Next.js preset, Node 22.x, pnpm 11.24.0, build `pnpm run build`, output `.next`, and the managed Next.js server. Set all three public values from [`.env.production.example`](.env.production.example) in the hosting environment before building. Keep the backend as its own Laravel service.

`npm run preflight:production` loads the same production environment files as Next.js and validates the configuration. The default build runs the check automatically. After building, `npm run smoke:hosting` starts the package server and checks health, page content and script/stylesheet delivery. A passing local build does not establish a successful Hostinger release.

For a local production-mode preview with the loopback origins in `.env.example`, use `npm run build:local` followed by `npm run start`. Do not publish that artifact. See [deployment settings and live verification](../DEPLOYMENT.md).

## Key Notes

- Public pages under `/founders`, `/events`, and `/programs` already read from the API with graceful fallbacks while migration away from seed data continues.
- Dashboard profile and dashboard events are wired to live member endpoints.
- Several dashboard and admin pages still need deeper API integration as tracked in the repository-level [TODO.md](../TODO.md).

## Repository Usage

From the repository root:

```bash
npm run dev:frontend
```

## Related Docs

- [README.md](../README.md)
- [PROJECT_STATUS.md](../PROJECT_STATUS.md)
- [TESTING.md](../TESTING.md)
- [docs/API.md](../docs/API.md)
