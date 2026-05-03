# Wosool Frontend

The frontend is a **Next.js 16 + React 19** application for Wosool's public site, member dashboard, and admin surfaces.

## Development

```bash
npm install
npm run lint
npm run build
npm run dev
```

The app expects the Laravel backend to be available for live API-backed routes such as authentication, profile management, event RSVP, and program applications.
For local development, the backend now defaults to a MySQL database defined in `backend/.env`.

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
