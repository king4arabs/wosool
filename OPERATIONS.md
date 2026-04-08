# Operations

> Wosool operational runbooks and procedures.

---

## Service Architecture

| Service | Host | Status |
|---------|------|--------|
| Frontend | Vercel (planned) | Not deployed |
| Backend API | Railway (planned) | Not deployed |
| Database | PostgreSQL (Supabase planned) | Local only |
| Cache | Redis (Upstash planned) | Local only |
| CDN/DNS | Cloudflare | Active |
| Monitoring | Sentry (planned) | Not configured |

---

## Runbooks

### 1. Local Development Start

```bash
# Terminal 1 — Backend
cd backend
php artisan serve

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 2. Database Operations

```bash
cd backend

# Run pending migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh database with seeds
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

### 3. SSL Certificate Repair

```bash
# Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"

npm run ops:ssl:repair
# Or directly: node scripts/ssl-repair.mjs
```

> **Full runbook:** [docs/SSL_RUNBOOK.md](./docs/SSL_RUNBOOK.md) — diagnosis,
> automated repair, manual procedures, and monitoring setup.

### 4. Cache Management

```bash
cd backend

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Queue Management (Planned)

```bash
cd backend

# Start queue worker
php artisan queue:work redis --queue=default,emails,notifications

# Monitor failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

---

## Monitoring Checklist

### Daily
- [ ] Check application error logs
- [ ] Verify API response times
- [ ] Monitor database connection pool

### Weekly
- [ ] Review error trends in Sentry
- [ ] Check dependency vulnerability alerts
- [ ] Verify backup integrity
- [ ] Review API usage metrics

### Monthly
- [ ] Update dependencies (npm update, composer update)
- [ ] Review and rotate API keys/tokens
- [ ] Performance audit (Lighthouse, load testing)
- [ ] Security scan review

---

## Backup Strategy (Planned)

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Database | Daily | 30 days | pg_dump to S3 |
| User uploads | Real-time | Indefinite | S3 versioning |
| Application code | Per commit | Indefinite | Git |
| Environment configs | On change | 90 days | Encrypted backup |

---

## Scaling Considerations

### Current (Pre-launch)
- Single instance frontend and backend
- Shared database connection

### Growth (Post-launch)
- Vercel auto-scaling for frontend
- Horizontal backend scaling via Railway
- Read replicas for database
- Redis cluster for caching
- CDN for static assets

### Enterprise (Future)
- Kubernetes orchestration
- Database connection pooling (PgBouncer)
- Queue workers with Horizon dashboard
- Full observability (Datadog/New Relic)

---

## On-Call Procedures

### Escalation Path

1. **Auto-alert** → UptimeRobot / Sentry notification
2. **L1 Response** → Check dashboards, assess severity
3. **L2 Response** → Debug and deploy fix
4. **L3 Escalation** → Infrastructure/database issues

### Contact Information

| Role | Responsibility |
|------|---------------|
| Platform Lead | Overall platform health |
| Backend Engineer | API and database issues |
| Frontend Engineer | UI/UX and build issues |
| DevOps | Infrastructure and deployments |
