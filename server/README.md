# Garage API (server)

Node.js + Express + SQL Server. Runs on `http://localhost:3000`, all routes start with `/api`.

## Run it
1. Run `database/create_tables.sql`, then `database/backend_updates.sql` in SSMS (database `GarageManagement`).
2. In `server/`: copy `.env.example` to `.env`, set `JWT_SECRET` (any long random text) and `FRONTEND_URL`.
3. `npm install`, then `npm run seed` (demo client `client@garage.com` / `client123` with a car and a repair).
4. `npm run dev`.

The owner is **not** seeded: open the app, **Sign up**, choose **Owner** (works only once).

## Files
| File | What it does |
|---|---|
| `server.js` | Starts Express after the DB connects, connects every route, handles errors |
| `db.js` | SQL Server connection (Windows Authentication) → `poolPromise` |
| `query.js` | `query(sql, params)`: runs a query with `@parameters` (protects from SQL injection) |
| `validate.js` | Input checks (email, password, VIN, year, cost, dates) |
| `middleware/auth.js` | `requireAuth` checks the JWT, `requireRole('owner')` checks the role |
| `routes/auth.js` | Sign up (client or owner once), login with role, logout |
| `routes/services.js` | Public list of services (fixed list, no table) |
| `routes/vin.js` | VIN decoder: calls the free NHTSA vPIC API to fill brand, model, year |
| `routes/client.js` | Client: my info, my cars, my repairs, my appointments |
| `routes/owner/*.js` | Owner: dashboard, clients, cars (+ search), repairs, appointments, bin |
| `seed.js` | Demo data |

## Security
- Passwords hashed with **bcrypt**. Login returns a **JWT** `{ id, role, clientId }`.
- `/api/owner/*` needs role `owner`, `/api/me/*` needs role `client`.
- Client routes take the client id **from the token only**, so a client can never reach another client's data.

## Endpoints
Send the token as `Authorization: Bearer <token>`. Every error is `{ "error": "..." }` (400, 401, 403, 404, 409).

**Public**
| Method | URL | Body |
|---|---|---|
| GET | /api/services | |
| GET | /api/auth/owner-exists | → `{ exists }` |
| POST | /api/auth/register-owner | email, password (works once only) |
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
