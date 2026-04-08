# Integrations Skills

> Third-party services, APIs, webhooks, and platform connections

---

## Integration Map

### Current Integrations

| Service | Category | Status |
|---------|----------|--------|
| Cloudflare | CDN/DNS/SSL | ✅ Active |
| Laravel Sanctum | Authentication | ✅ Installed |
| Spatie Permission | Authorization | ✅ Installed |

### Planned Integrations

| Service | Category | Priority |
|---------|----------|----------|
| Sentry | Error monitoring | Critical |
| PostHog | Analytics | High |
| Resend | Email delivery | High |
| Supabase | Database hosting | High |
| Upstash | Redis hosting | High |
| OpenAI | AI/LLM | Medium |
| Moyasar | Payments (SAR) | Medium |
| Stripe | Payments (global) | Medium |
| Intercom/Crisp | Customer support | Medium |

---

## Integration Categories

### Authentication & Identity

| Service | Use Case | Notes |
|---------|----------|-------|
| Laravel Sanctum | API token auth | Primary (installed) |
| Clerk | Social auth, magic links | Alternative |
| Auth0 | Enterprise SSO | Future |
| Firebase Auth | Social login | Alternative |

### Email & Communications

| Service | Use Case | Notes |
|---------|----------|-------|
| Resend | Transactional emails | Recommended |
| SendGrid | Bulk email | Alternative |
| Postmark | Transactional email | Alternative |
| Amazon SES | High-volume email | Scale option |

### Payments

| Service | Use Case | Notes |
|---------|----------|-------|
| Moyasar | SAR payments (Saudi) | Primary for Saudi |
| Stripe | International payments | Primary for global |
| Paddle | SaaS subscriptions | Alternative |
| Dodo / Lemon Squeezy | Digital products | Alternative |

### Storage & CDN

| Service | Use Case | Notes |
|---------|----------|-------|
| Supabase Storage | User uploads | Primary |
| AWS S3 | File storage | Alternative |
| Cloudflare R2 | CDN storage | Alternative |
| Uploadcare | Image processing | Alternative |

### Analytics & Monitoring

| Service | Use Case | Notes |
|---------|----------|-------|
| PostHog | Product analytics | Recommended |
| Plausible | Privacy-friendly analytics | Alternative |
| Sentry | Error tracking | Recommended |
| UptimeRobot | Uptime monitoring | Recommended |
| Datadog | Full observability | Future |

### AI & Machine Learning

| Service | Use Case | Notes |
|---------|----------|-------|
| OpenAI | Text generation, embeddings | Primary |
| Anthropic | Analysis, review | Alternative |
| Replicate | Model hosting | Future |
| Hugging Face | Open-source models | Future |

### Search

| Service | Use Case | Notes |
|---------|----------|-------|
| Meilisearch | Full-text search | Recommended |
| Algolia | Search-as-a-service | Alternative |
| Typesense | Open-source search | Alternative |
| PostgreSQL FTS | Built-in search | Starting point |

### Automation

| Service | Use Case | Notes |
|---------|----------|-------|
| Webhooks | Event-driven integrations | Built-in |
| Zapier | No-code automation | For ops team |
| n8n | Self-hosted automation | Alternative |
| Make | Visual automation | Alternative |

---

## Integration Standards

### API Client Pattern

```php
// Backend: Use Laravel HTTP client
Http::withToken($apiKey)
    ->timeout(30)
    ->retry(3, 100)
    ->get('https://api.example.com/v1/resource');
```

### Configuration
- Store API keys in `.env` (never in code)
- Use Laravel config files for integration settings
- Implement circuit breaker for external API calls
- Log all external API calls for debugging

### Error Handling
- Retry transient failures (3 attempts, exponential backoff)
- Circuit breaker for persistent failures
- Graceful degradation (fallback to cached data)
- Alert on integration failures (Sentry)

---

## Webhook Architecture (Planned)

### Inbound Webhooks
- Stripe/Moyasar payment events
- Clerk auth events
- GitHub deployment events

### Outbound Webhooks
- Application status changes
- New founder joins
- Event updates

### Webhook Security
- Signature verification
- IP allowlisting
- Idempotency keys
- Retry with exponential backoff

---

## Integration Checklist

- [ ] API keys stored in .env (never committed)
- [ ] Error handling with retries and fallbacks
- [ ] Rate limiting for outbound API calls
- [ ] Monitoring for integration health
- [ ] Documentation for each integration
- [ ] Testing with mock responses
- [ ] Webhook signature verification
- [ ] Circuit breaker pattern implemented
