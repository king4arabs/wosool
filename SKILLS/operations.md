# Operations Skills

> Platform operations, monitoring, scaling, incident management

---

## Operational Architecture

### Services

| Service | Technology | Host | Status |
|---------|-----------|------|--------|
| Frontend | Next.js 16 | Vercel (planned) | Local only |
| Backend API | Laravel 13 | Railway (planned) | Local only |
| Database | PostgreSQL 16 | Supabase (planned) | Local only |
| Cache | Redis 7 | Upstash (planned) | Local only |
| CDN/DNS | Cloudflare | Cloudflare | Active |
| SSL | Cloudflare | Cloudflare | Active |

---

## Monitoring Stack (Planned)

| Tool | Purpose | Priority |
|------|---------|----------|
| Sentry | Error tracking (frontend + backend) | Critical |
| UptimeRobot | Uptime and SSL monitoring | High |
| Laravel Telescope | Request/query debugging (dev) | Medium |
| PostHog | Product analytics | Medium |
| Datadog / New Relic | Full observability | Future |

---

## Runbooks

### Database Maintenance

```bash
cd backend

# Run migrations
php artisan migrate

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check queue health
php artisan queue:monitor redis:default
```

### SSL Certificate Management

```bash
# Check SSL status
curl -vI https://wosool.org 2>&1 | grep -i "ssl\|certificate\|expire"

# Repair via Cloudflare API
npm run ops:ssl:repair
```

### Emergency Response

1. **Service down** → Check hosting dashboard, restart service
2. **Database issue** → Check connections, restart, restore from backup
3. **Security incident** → Rotate credentials, assess impact, notify users
4. **High traffic** → Scale horizontally, enable CDN caching

---

## Backup Strategy

| Data | Method | Frequency | Retention |
|------|--------|-----------|-----------|
| Database | pg_dump → S3 | Daily | 30 days |
| User uploads | S3 versioning | Real-time | Indefinite |
| Code | Git | Per commit | Indefinite |
| Configs | Encrypted backup | On change | 90 days |
| Logs | Log rotation | Daily | 14 days |

---

## Scaling Plan

### Phase 1 — Single Instance
- Vercel for frontend (auto-scaling)
- Railway single instance for backend
- Supabase shared database
- Upstash Redis (serverless)

### Phase 2 — Multi-Instance
- Backend horizontal scaling (Railway)
- Database connection pooling (PgBouncer)
- CDN for all static assets
- Queue workers for async tasks

### Phase 3 — Enterprise
- Kubernetes cluster
- Database read replicas
- Redis cluster
- Full observability stack
- Multi-region deployment

---

## SLA Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | UptimeRobot |
| API response time (p95) | < 500ms | Application monitoring |
| Page load time (p95) | < 2s | Lighthouse CI |
| Error rate | < 0.1% | Sentry |
| Deployment frequency | Daily | CI/CD metrics |
| MTTR | < 1 hour | Incident tracking |

---

## Cost Optimization

| Strategy | Action |
|----------|--------|
| Right-sizing | Start with smallest viable instances |
| Caching | Redis for API responses, CDN for static |
| Image optimization | Next.js image optimization |
| AI cost control | Cache AI responses, use smaller models |
| Monitoring | Track costs weekly, alert on anomalies |

---

## Operational Checklist

### Daily
- [ ] Check error dashboard (Sentry)
- [ ] Verify uptime alerts
- [ ] Monitor API response times

### Weekly
- [ ] Review error trends
- [ ] Check dependency alerts
- [ ] Verify backup integrity
- [ ] Review API usage metrics
- [ ] Monitor infrastructure costs

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Performance audit
- [ ] Security scan review
- [ ] Cost review and optimization
