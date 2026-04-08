# DevOps Skills

> CI/CD, Docker, GitHub Actions, infrastructure as code

---

## Current State

| Area | Status | Notes |
|------|--------|-------|
| CI/CD | ❌ Missing | No GitHub Actions workflows |
| Docker | ❌ Missing | No Dockerfiles |
| Infrastructure as Code | ❌ Missing | No Terraform/Pulumi |
| Environment management | 🟡 Basic | .env files only |
| Deployment automation | ❌ Missing | Manual deployment |

---

## Planned CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI — Lint, Test, Build

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build

  backend:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:16, env: {...} }
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: 8.3 }
      - run: cd backend && composer install --no-interaction
      - run: cd backend && cp .env.example .env && php artisan key:generate
      - run: cd backend && php artisan test
```

#### 2. Deploy — Production

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    # Vercel auto-deploy via GitHub integration

  deploy-backend:
    # Railway auto-deploy via GitHub integration
```

---

## Docker (Planned)

### Development Containers

```dockerfile
# backend/Dockerfile
FROM php:8.3-fpm
# Laravel with PHP extensions

# frontend/Dockerfile
FROM node:20-alpine
# Next.js build and serve
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  backend:
    build: ./backend
    ports: ["8000:8000"]
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
  redis:
    image: redis:7
    ports: ["6379:6379"]
```

---

## Conventions

### Branch Strategy
- `main` — production-ready code
- `staging` — pre-production testing
- `feature/*` — new features
- `fix/*` — bug fixes
- `docs/*` — documentation updates
- `copilot/*` — AI-assisted changes

### Commit Messages
- Conventional Commits format
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation
- `chore:` maintenance
- `test:` test additions
- `ci:` CI/CD changes

### Release Process
1. Create feature branch
2. Implement with tests
3. Open PR with changelog entry
4. CI passes (lint, test, build)
5. Code review and approval
6. Merge to main
7. Auto-deploy to production
8. Tag release with semantic version

---

## Checklist

### CI/CD
- [ ] GitHub Actions CI workflow (lint, test, build)
- [ ] Automated deployment on merge to main
- [ ] PR status checks (required)
- [ ] Branch protection rules
- [ ] Dependabot alerts enabled
- [ ] Secret scanning enabled
- [ ] Code scanning (CodeQL)

### Containerization
- [ ] Backend Dockerfile
- [ ] Frontend Dockerfile
- [ ] docker-compose.yml for local dev
- [ ] Multi-stage builds for production

### Infrastructure
- [ ] Terraform/Pulumi for cloud resources
- [ ] Environment variable management
- [ ] Secrets management (GitHub Secrets)
- [ ] SSL certificate automation
- [ ] CDN configuration
- [ ] Database backup automation

### Monitoring
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation
- [ ] Performance monitoring
- [ ] Alerting rules

---

## Recommended Tools

| Tool | Purpose | Priority |
|------|---------|----------|
| GitHub Actions | CI/CD pipelines | Critical |
| Docker | Containerization | High |
| Vercel | Frontend hosting | High |
| Railway | Backend hosting | High |
| Sentry | Error monitoring | High |
| UptimeRobot | Uptime monitoring | Medium |
| Terraform | Infrastructure as code | Future |
| Kubernetes | Container orchestration | Future |
