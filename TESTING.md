# Testing

> Wosool testing strategy and standards.

---

## Testing Philosophy

- Test critical paths first (auth, applications, payments)
- Prefer integration tests over unit tests for API endpoints
- Test business logic in isolation
- Use factories and seeders for test data
- Aim for 80%+ coverage on business-critical code

---

## Current State

| Area | Status | Framework |
|------|--------|-----------|
| Backend unit tests | ❌ Not started | PHPUnit |
| Backend feature tests | ❌ Not started | PHPUnit |
| Frontend unit tests | ❌ Not started | Vitest (recommended) |
| Frontend component tests | ❌ Not started | React Testing Library |
| Frontend E2E tests | ❌ Not started | Playwright (recommended) |
| API integration tests | ❌ Not started | PHPUnit |

---

## Backend Testing (Laravel + PHPUnit)

### Setup

```bash
cd backend
cp .env.example .env.testing
php artisan key:generate --env=testing

# Configure test database in .env.testing
php artisan test
```

### Test Structure

```
backend/tests/
├── Feature/           # HTTP/API integration tests
│   ├── Api/
│   │   ├── FounderApiTest.php
│   │   ├── EventApiTest.php
│   │   ├── ApplicationApiTest.php
│   │   └── ContactApiTest.php
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   └── RegistrationTest.php
│   └── ...
├── Unit/              # Isolated business logic tests
│   ├── Models/
│   │   ├── UserTest.php
│   │   └── ApplicationTest.php
│   ├── Services/
│   └── ...
└── TestCase.php       # Base test class
```

### Priority Test Cases

1. **API endpoints** — all GET endpoints return correct data
2. **Application submission** — validates input, creates record
3. **Contact form** — validates input, stores message
4. **Authentication** — login, logout, token validation
5. **Authorization** — role-based access enforcement
6. **Model relationships** — associations return correct data

### Running Tests

```bash
cd backend
php artisan test                    # All tests
php artisan test --filter=Api       # API tests only
php artisan test --coverage         # With coverage report
```

---

## Frontend Testing (Recommended: Vitest + RTL + Playwright)

### Recommended Setup

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D playwright @playwright/test
```

### Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── button.test.tsx    # Component tests
│   ├── lib/
│   │   ├── utils.ts
│   │   └── utils.test.ts         # Unit tests
│   └── app/
│       └── __tests__/            # Page-level tests
├── e2e/                          # End-to-end tests
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   └── apply.spec.ts
└── vitest.config.ts
```

### Priority Test Cases

1. **Page rendering** — all 17 routes render without errors
2. **Navigation** — header/footer links work correctly
3. **Forms** — apply and contact forms validate and submit
4. **Responsive design** — layouts adapt to mobile/tablet/desktop
5. **Component library** — buttons, cards, badges render correctly
6. **Accessibility** — keyboard navigation, ARIA labels

---

## API Contract Testing

### Validate API responses match expected schema:

```
POST /api/v1/applications
  → 201 Created with application data
  → 422 Unprocessable with validation errors

GET /api/v1/founders
  → 200 OK with { data: [...] }
  → Paginated response with meta

GET /api/v1/founders/{slug}
  → 200 OK with { data: {...} }
  → 404 Not Found for invalid slug
```

---

## Test Data Management

| Strategy | Tool | Usage |
|----------|------|-------|
| Factories | Laravel ModelFactory | Generate test data |
| Seeders | WosoolSeeder | Consistent demo datasets |
| Mock data | seed.ts (frontend) | Static frontend data |
| API mocking | MSW (recommended) | Frontend API test doubles |

---

## CI Testing Pipeline (Planned)

```yaml
# Runs on every push and PR
frontend-tests:
  - npm ci
  - npm run lint
  - npm run build
  - npx vitest run

backend-tests:
  - composer install
  - cp .env.example .env.testing
  - php artisan key:generate --env=testing
  - php artisan test --coverage
```

---

## Quality Gates

| Gate | Threshold | Status |
|------|-----------|--------|
| Backend test pass | 100% | ❌ No tests |
| Frontend lint pass | 0 errors | ✅ Passing |
| Frontend build pass | 0 errors | ✅ Passing |
| Code coverage | 80%+ (target) | ❌ Not measured |
| E2E critical paths | 100% | ❌ No tests |
