# SDK and Client Integration Guide

## Purpose

This document defines how frontend pages and future external clients should consume Wosool data consistently. It does not yet represent a published package; instead, it establishes the **contract conventions** that a typed SDK should eventually formalize.

---

## Client Design Principles

| Principle | Meaning |
|---|---|
| One API layer | Centralize HTTP calls in `frontend/src/lib/api.ts` |
| Typed boundaries | Keep transport and UI types explicit |
| Graceful fallback | Support controlled fallback while migration away from seed data is in progress |
| Additive evolution | Add methods without forcing large page rewrites |
| Region-aware boundaries | Keep locale, currency, and market context close to the client layer |

---

## Recommended Frontend Shape

The frontend should migrate away from direct use of `seed.ts` toward a service layer that normalizes backend responses before they reach page components.

```ts
export const api = {
  founders: {
    list: (params?: Record<string, string | number | boolean>) => get('/founders', params),
    bySlug: (slug: string) => get(`/founders/${slug}`),
  },
  companies: {
    list: (params?: Record<string, string | number | boolean>) => get('/companies', params),
    bySlug: (slug: string) => get(`/companies/${slug}`),
  },
  member: {
    founderProfile: {
      get: () => get('/member/founder-profile'),
      update: (payload: Record<string, unknown>) => put('/member/founder-profile', payload),
    },
    companies: {
      list: () => get('/member/companies'),
      create: (payload: Record<string, unknown>) => post('/member/companies', payload),
      update: (id: number, payload: Record<string, unknown>) => put(`/member/companies/${id}`, payload),
      remove: (id: number) => del(`/member/companies/${id}`),
    },
    events: {
      myRsvps: () => get('/member/events/rsvps'),
      rsvp: (slug: string) => post(`/member/events/${slug}/rsvp`),
      cancelRsvp: (slug: string) => del(`/member/events/${slug}/rsvp`),
    },
    programs: {
      myApplications: () => get('/member/program-applications'),
      apply: (slug: string, payload: Record<string, unknown>) => post(`/member/programs/${slug}/apply`, payload),
    },
  },
}
```

> The frontend `lib/api.ts` already sends `credentials: "include"` on every request, so member endpoints work transparently over the Sanctum session cookie.

---

## Integration Roadmap

| Stage | Client behavior |
|---|---|
| Stage 1 | Static seed data for UI iteration |
| Stage 2 | Hybrid API wrappers with optional fallback |
| Stage 3 | Live API-powered public pages |
| Stage 4 | Authenticated dashboard and admin flows |
| Stage 5 | Shared typed SDK across frontend and external integrations |

---

## Error Handling Expectations

| Error case | UI expectation |
|---|---|
| Network failure | Retry-oriented empty state |
| Validation error | Field-level guidance where relevant |
| 404 response | Not-found or domain-specific empty state |
| Rate-limited response | Human-readable retry guidance |
| Unknown failure | Safe fallback plus monitoring hook |

---

## Future SDK Scope

A formal SDK should eventually include typed clients for public resources, authenticated member flows, admin workflows, analytics events, and bilingual content handling. Until then, `frontend/src/lib/api.ts` should remain the single source of truth for frontend data access conventions.
