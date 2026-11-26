# Garage API (server)

Node.js + Express + SQL Server. Runs on `http://localhost:3000`, all routes start with `/api`.

## Run it
1. Create the database `GarageManagement` and run `database/create_tables.sql` in it.
2. In `server/`: copy `.env.example` to `.env` and fill it in:
   - on a laptop with SQL Server: `DB_SERVER=localhost`, leave `DB_USER` empty → Windows Authentication (needs ODBC Driver 18);
   - with Azure SQL: `DB_USER=garage_app` + `DB_PASSWORD` (see `database/create_app_user.sql`);
   - `JWT_SECRET`: any long random text.
3. `npm install`, then create the owner **once**: `npm run create-owner -- owner@example.com MyPassword123`
4. `npm run dev`. Tests: `npm test` (no database needed).

The database starts **empty** (no built-in data). Clients create their own account with **Sign up** on the website. The owner logs in with the **Owner** choice.

## Files
| File | What it does |
|---|---|
| `app.js` | The Express app: security (helmet, CORS, rate limits), every route, error handling. The tests import it |
| `server.js` | Starts the app on `PORT` and connects to the database in the background |
| `db.js` | `getPool()`: connects on first use. `DB_USER` filled → SQL login (Azure), empty → Windows login. Retries if the DB was down |
| `dates.js` | `toSqlDateTime()`: turns a form date (`2026-11-28T10:30`) into the SQL Server format |
| `query.js` | `query(sql, params)`: runs a query with `@parameters` (protects from SQL injection) |
| `validate.js` | Input checks (email, password, VIN, year, cost, dates) |
| `middleware/auth.js` | `requireAuth` checks the JWT, `requireRole('owner')` checks the role |
| `routes/auth.js` | Client sign up, login with role, logout |
| `create-owner.js` | One-time command that creates the owner account |
| `routes/vin.js` | VIN decoder: calls the free NHTSA vPIC API to fill brand, model, year |
| `routes/client.js` | Client: my info, my cars, my repairs, my appointments |
| `routes/owner/*.js` | Owner: dashboard, clients, cars (+ search), repairs, appointments, bin |

| `tests/validate.test.js` | Unit tests of the input checks and the date helper |
| `tests/routes.test.js` | API tests with **Supertest** (tokens, roles, bad input, headers, CORS, rate limit) |

## Security
- Passwords hashed with **bcrypt**. Login returns a **JWT** `{ id, role, clientId }`.
- **helmet** headers, **CORS** limited to `FRONTEND_URL`, JSON body limit 100 kb.
- **Rate limit**: 10 wrong logins per 15 minutes, 10 sign ups per hour (answers 429).
- Every query goes through `query.js` with `@parameters` (no SQL injection).
- `/api/owner/*` needs role `owner`, `/api/me/*` needs role `client`.
- Client routes take the client id **from the token only**, so a client can never reach another client's data.

## Endpoints
Send the token as `Authorization: Bearer <token>`. Every error is `{ "error": "..." }` (400, 401, 403, 404, 409, 429, 503 when the database is asleep or unreachable).

**Public**
| Method | URL | Body |
|---|---|---|
| POST | /api/auth/register | name, phone, email, password (client) |
| POST | /api/auth/login | email, password, role (`client` / `owner`) → `{ token, user: { id, email, role } }` |
| POST | /api/auth/logout | |

**Any logged-in user (owner or client)**
| Method | URL | Body |
|---|---|---|
| GET | /api/vin/:vin | → `{ brand, model, year }` from the NHTSA vPIC API (404 if unknown, 502 if the service is down) |

**Client (`/api/me`)**: view, add cars, book. Can NOT edit his info or cars.
| Method | URL | Body |
|---|---|---|
| GET | /api/me | → `{ id, name, phone, email }` |
| GET / POST | /api/me/cars | brand, model, year, vin (17), plate_number (optional) |
| GET | /api/me/repairs | |
| GET / POST | /api/me/appointments | car_id, service_requested, preferred_datetime, notes |
| PATCH | /api/me/appointments/:id/respond | accept: true / false (only when status is `rescheduled`) |

**Owner (`/api/owner`)**: delete = move to the bin, restore from the bin.
| Method | URL | Notes |
|---|---|---|
| GET | /api/owner/dashboard | totals, repairs in progress, pending appointments, income this month |
| GET | /api/owner/clients | `?name=` search (the owner does NOT add clients) |
| GET / PUT / DELETE | /api/owner/clients/:id | GET: client + cars + repairs + total_spent. PUT: name, phone, email (= his login) |
| GET / POST | /api/owner/cars | client_id, brand, model, year, vin required, plate_number optional |
| GET | /api/owner/cars/search?q= | plate **or** VIN → car + owner + repairs |
| GET / PUT / DELETE | /api/owner/cars/:id | |
| GET / POST | /api/owner/repairs | POST: `{ car_id, date, status, items: [{ description, cost }] }` (one or more) |
| GET / PUT / DELETE | /api/owner/repairs/:id | PUT: description, cost, date, status |
| GET | /api/owner/bin | deleted clients, cars, repairs |
| PATCH | /api/owner/bin/:type/:id/restore | type = clients, cars or repairs |
| GET | /api/owner/appointments | `?status=pending` |
| PATCH | /api/owner/appointments/:id/accept · /reject · /propose | propose: proposed_datetime → status `rescheduled` |

## Rules
- A client can't be deleted while he has cars, and a car can't be deleted while it has repairs.
- Restore a car only if its client is active, and a repair only if its car is active.
- Appointment statuses: `pending` → owner: `accepted`, `rejected` or `rescheduled` (new date). Client answers a `rescheduled`: accept → `accepted` at the new date, decline → `rejected`.
