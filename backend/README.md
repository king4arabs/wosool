# Wosool Backend

The backend is a **Laravel 13** API serving public content, authentication, and member workflows for the Wosool platform.

## Development

```bash
composer install
npm ci
php ../scripts/prepare-backend.php
php artisan migrate
php artisan eoa:install
composer run dev
```

For a repository-level setup flow, use:

```bash
npm run setup
```

## Test and Validate

```bash
composer run test
npm run build
```

## API Surface

- Public read endpoints for founders, companies, events, programs, partners, sponsors, news, and resources
- Public write endpoints for applications and contact submissions
- Sanctum-based SPA authentication
- Member endpoints for founder profile, companies, event RSVPs, and program applications

The current member API routes are defined in [routes/api.php](./routes/api.php).

## Default Local Database

Local development defaults to SQLite via `.env.example`; `npm run setup` creates the database file automatically.

```text
DB_CONNECTION=sqlite
```

For MySQL or PostgreSQL, configure `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in your own `.env` and create the database before migrating.

## Production deployment

Use PHP 8.3.36+, 8.4.27+, or 8.5.12+ on the corresponding stable branch. Composer checks the runtime floor before installing. Serve only `public/` through the PHP handler on `api.wosool.org`.

Use [`.env.production.example`](.env.production.example) as a reference, preserving the live database, `APP_KEY`, persistent private files and uploads. Deploy additive migrations, compile Laravel caches, and verify `/api/health` and `/api/ready`. Queue supervision, scheduler execution and real SMTP delivery require separate checks. See [DEPLOYMENT.md](../DEPLOYMENT.md) for the complete release and rollback sequence.

The optional `php artisan db:seed` command creates fictional development accounts with known passwords. Run it only in an isolated local database; the demonstration seeder rejects production. Production roles can be initialized separately with `RoleAndPermissionSeeder`; create real users through the approved account workflow.

## Related Docs

- [README.md](../README.md)
- [PROJECT_STATUS.md](../PROJECT_STATUS.md)
- [TESTING.md](../TESTING.md)
- [docs/API.md](../docs/API.md)
