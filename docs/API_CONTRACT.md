# Wosool — API Contract

## Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://wosool.org/api/v1
```

## Authentication

Laravel Sanctum token-based authentication. Protected endpoints require a valid bearer token.

```
Authorization: Bearer {token}
```

## Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/founders` | List founders |
| GET | `/companies` | List companies |
| GET | `/events` | List events |
| GET | `/programs` | List programs |
| GET | `/partners` | List partners |
| GET | `/sponsors` | List sponsors |
| GET | `/news` | List news items |
| POST | `/applications` | Submit membership application |
| POST | `/contact` | Submit contact inquiry |

## Response Format

All endpoints return JSON:

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "total": 50,
    "per_page": 15
  }
}
```

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 422 | Unprocessable Entity — validation errors |
| 500 | Internal Server Error |

## CORS

CORS is configured in `backend/config/cors.php`. Development allows `localhost:3000`.

## Rate Limiting

Laravel's built-in throttle middleware is applied to API routes. Default: 60 requests/minute per IP.
