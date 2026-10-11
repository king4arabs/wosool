# Wosool API Contract Registry (v1)

## Transport and Auth
- Base path: `/api/v1`
- Format: `application/json`
- Auth: cookie/session + Sanctum (`auth:sanctum`) for member/admin routes
- Mutations: CSRF-protected

## Canonical Member Contracts

### Founder Profile
- `GET /member/founder-profile`
- Response `data`:
  - `id:number`
  - `user_id:number`
  - `legal_name:string`
  - `title:string`
  - `biography_summary:string|null`
  - `skills_tags:string[]`
  - `vetted_status:boolean`
  - `momentum_score:number`
  - `profile_markdown:string|null`

### Companies
- `GET /member/companies`
- Response: wrapped collection (`data[]`) mapped to company cards.
- Transitional compatibility supported for legacy fields (`name/stage/location/website`) and canonical fields (`legal_name/operational_stage/hq_location/domain_url`).

### Scorecard
- `GET /member/scorecard`
- `POST /member/scorecard/recalculate`
- Response `data`:
  - `id:number`
  - `founder_profile_id:number`
  - `aggregate_score:number`
  - `tracking:{momentum,growth,readiness,support_delta}`
  - `trends:{...}`
  - `insights:{dynamic_alerts,automated_action_suggestions}`
  - `historical_logs:array`

### Introductions
- `GET /member/introductions`
- `POST /member/introductions`
- `PATCH /member/introductions/{intro}/approve`
- `PATCH /member/introductions/{intro}/decline`
- `routing_status` enum:
  - `INTRO_PENDING`
  - `INTRO_APPROVED`
  - `ROUTE_EXPIRED`
  - `DECLINED`

## Error Envelope
- Standard error shape:
  - `message:string`
  - `errors?:Record<string,string[]>`
  - `meta?:Record<string,unknown>`

## Transition Policy
- Frontend must parse with runtime guards and not render raw API payloads directly.
- Legacy fields remain tolerated while member/admin screens migrate to canonical v1 fields.
