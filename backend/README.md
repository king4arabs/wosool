# Wosool Backend

The backend is a **Laravel 13** API serving public content, authentication, and member workflows for the Wosool platform.

## Development

```bash
composer install
npm install
cp .env.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate
php artisan db:seed
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

## Seeded Accounts

After `php artisan db:seed`, use these accounts:

```text
Admin  : admin@wosool.org / wosool2024!
Member : sara@example.com / demo123!
Member : khalid@example.com / demo123!
Member : nora@example.com / demo123!
Member : ahmed@example.com / demo123!
Member : lina@example.com / demo123!
Member : omar@example.com / demo123!
```

## Related Docs

- [README.md](../README.md)
- [PROJECT_STATUS.md](../PROJECT_STATUS.md)
- [TESTING.md](../TESTING.md)
- [docs/API.md](../docs/API.md)
