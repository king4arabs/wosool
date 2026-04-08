# QA Skills

> Testing strategy, code quality, review processes

---

## Testing Stack

| Tool | Purpose | Status |
|------|---------|--------|
| PHPUnit | Backend testing | Installed, no tests |
| Vitest | Frontend unit testing | Recommended |
| React Testing Library | Component testing | Recommended |
| Playwright | E2E testing | Recommended |
| Laravel Pint | PHP code style | Installed |
| ESLint | JS/TS linting | Configured |

---

## Testing Pyramid

```
        ╱╲
       ╱E2E╲          Playwright — critical user flows
      ╱──────╲
     ╱Integra-╲       PHPUnit Feature — API endpoints
    ╱──tion────╲
   ╱────────────╲
  ╱  Unit Tests  ╲    PHPUnit Unit + Vitest — business logic
 ╱────────────────╲
```

### Priority Order
1. **API endpoint tests** — Every endpoint returns correct data/status
2. **Model tests** — Relationships, scopes, business rules
3. **Component tests** — Key UI components render correctly
4. **E2E tests** — Critical flows (apply, login, navigate)

---

## Code Quality Standards

### PHP (Backend)
- PSR-12 code style (enforced by Laravel Pint)
- Strict types where possible
- Type declarations on all parameters and returns
- PHPDoc for complex methods

### TypeScript (Frontend)
- Strict mode enabled in tsconfig.json
- No `any` types (use proper typing)
- Interfaces for all data structures
- ESLint rules enforced

---

## Code Review Checklist

### General
- [ ] Code follows established conventions
- [ ] No hardcoded values (use config/constants)
- [ ] Error handling is comprehensive
- [ ] No console.log or debug code
- [ ] Performance considerations addressed

### Backend
- [ ] Input validation via Form Requests
- [ ] Authorization checks present
- [ ] Database queries optimized (no N+1)
- [ ] Tests included for new functionality
- [ ] Migrations are reversible

### Frontend
- [ ] Components are accessible (ARIA)
- [ ] Responsive design verified
- [ ] TypeScript types properly defined
- [ ] No prop drilling (use context where appropriate)
- [ ] Loading and error states handled

---

## Quality Gates

| Gate | Threshold | Enforcement |
|------|-----------|-------------|
| Lint (frontend) | 0 errors | CI block |
| Lint (backend) | PSR-12 clean | CI block |
| Build (frontend) | Success | CI block |
| Tests (backend) | 100% pass | CI block |
| Tests (frontend) | 100% pass | CI block |
| Coverage | 80%+ (target) | CI warning |
| PR approval | 1+ review | Branch protection |

---

## Test Data Management

| Strategy | Tool | When to Use |
|----------|------|-------------|
| Factories | Laravel ModelFactory | Generating test data |
| Seeders | WosoolSeeder | Consistent demo datasets |
| Fixtures | JSON/PHP files | Static reference data |
| Mock data | seed.ts | Frontend development |
| API mocking | MSW | Frontend testing |

---

## Continuous Improvement

- Track bug frequency by area
- Monitor test execution time
- Review flaky tests quarterly
- Update test coverage targets
- Conduct periodic code quality audits
