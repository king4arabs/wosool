# API Contract

## Base path

`/api/v1`

## Read endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/founders` | List founder profiles |
| GET | `/founders/{slug}` | Fetch a founder profile |
| GET | `/companies` | List company profiles |
| GET | `/companies/{slug}` | Fetch a company profile |
| GET | `/events` | List events |
| GET | `/events/{slug}` | Fetch an event |
| GET | `/programs` | List programs |
| GET | `/programs/{slug}` | Fetch a program |
| GET | `/partners` | List partners |
| GET | `/sponsors` | List sponsors |
| GET | `/news` | List news items |
| GET | `/news/{slug}` | Fetch a news item |

## Write endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/applications` | Submit a founder application |
| POST | `/contact` | Submit a contact request |

## Notes

- The contract is defined in `backend/routes/api.php`
- The current API is public-content oriented and does not yet expose authenticated CRUD flows for member management
