# Backend Skills

> Laravel 13, PHP 8.3, REST API, Eloquent ORM

---

## Current Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Laravel | 13.0 | PHP web framework |
| PHP | 8.3 | Runtime |
| Sanctum | 4.3 | API token authentication |
| Spatie Permission | 7.2 | Role-based access control |
| Eloquent | — | ORM (database abstraction) |
| PHPUnit | — | Testing framework |
| Laravel Pint | — | Code style (PSR-12) |

---

## Conventions

### File Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   # API controllers (8)
│   │   ├── Middleware/        # Custom middleware
│   │   └── Requests/         # Form Request validation (planned)
│   ├── Models/                # Eloquent models (12)
│   ├── Services/              # Business logic (planned)
│   └── Providers/
├── database/
│   ├── migrations/            # Schema migrations (15)
│   ├── factories/             # Model factories
│   └── seeders/               # Data seeders
├── routes/
│   ├── api.php                # API v1 routes
│   └── web.php                # Web routes
├── config/                    # 11 config files
└── tests/
    ├── Feature/               # Integration tests
    └── Unit/                  # Unit tests
```

### Naming
- **Models:** PascalCase singular (`FounderProfile`)
- **Controllers:** PascalCase with `Controller` suffix (`FounderController`)
- **Migrations:** snake_case with timestamp prefix
- **Database columns:** snake_case (`first_name`, `created_at`)
- **Routes:** kebab-case (`/api/v1/founder-profiles`)

### API Design
- Base URL: `/api/v1`
- JSON responses: `{ data: [...] }` or `{ data: {...} }`
- HTTP status codes: 200 (OK), 201 (Created), 404 (Not Found), 422 (Validation Error)
- Slug-based resource URLs for public content
- Pagination with `?page=` and `?per_page=` parameters

### Models
- 12 Eloquent models: User, FounderProfile, CompanyProfile, Application, Scorecard, ScorecardMetric, Event, Program, Cohort, NewsItem, PartnerProfile, SponsorProfile
- Use `$fillable` for mass assignment protection
- Define relationships explicitly

---

## Build & Development

```bash
cd backend
composer install                # Install dependencies
cp .env.example .env            # Configure environment
php artisan key:generate        # Generate app key
php artisan migrate             # Run migrations
php artisan db:seed             # Seed demo data
php artisan serve               # Dev server (localhost:8000)
php artisan test                # Run tests
./vendor/bin/pint               # Code style fix (PSR-12)
```

---

## Checklist

### Code Quality
- [x] PSR-12 code style (Pint)
- [ ] Form Request validation classes
- [ ] Service layer for business logic
- [ ] API Resource transformers
- [ ] Repository pattern for complex queries
- [ ] Custom exception handling

### API
- [x] RESTful endpoints (14 routes)
- [x] JSON response format
- [ ] API versioning strategy documented
- [ ] Rate limiting
- [ ] Request throttling
- [ ] OpenAPI/Swagger documentation
- [ ] API response caching

### Authentication & Authorization
- [x] Sanctum installed
- [x] Spatie Permission installed
- [ ] Auth controllers implemented
- [ ] Role seeding (founder, partner, sponsor, admin)
- [ ] Permission middleware on routes
- [ ] Token scoping

### Database
- [x] 15 migrations
- [x] Model factories (User)
- [x] Seeders (WosoolSeeder)
- [ ] Factories for all models
- [ ] Database indexing review
- [ ] Soft deletes on key models

### Testing
- [ ] Feature tests for all API endpoints
- [ ] Unit tests for business logic
- [ ] Factory-based test data
- [ ] Code coverage reporting
- [ ] CI test automation

---

## Recommended Patterns

| Pattern | Usage |
|---------|-------|
| Form Requests | Input validation (replace inline validation) |
| API Resources | Response transformation (consistent format) |
| Service classes | Business logic extraction from controllers |
| Events/Listeners | Async processing (emails, notifications) |
| Policies | Authorization logic per model |
| Observers | Model lifecycle hooks |
| Jobs/Queues | Background processing |
