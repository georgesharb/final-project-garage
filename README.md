# GTA V Garage: garage management web app

Final project of **020WBPES3 – Web Programming** (USJ ESIB).
A garage website where **clients** book appointments and follow their repairs online,
and the **owner** manages clients, cars, repairs and appointments from one panel.

## Try it online

||Link|
|-|-|
|Website (front end)|**https://gtav-garage.onrender.com**|
|API (back end)|**https://gtav-garage-api.onrender.com** (shows "Garage Management API is running!")|

**Demo accounts**

|Role|Email|Password|
|-|-|-|
|Owner|`owner@gtavgarage.test`|`Vasken@123`|
|Client|`testclient@example.com`|`Test1234!` (or create your own with **Sign up**)|

> The API and the database are on free plans that \*\*sleep when nobody uses them\*\* (the website itself does not).
> The first visit can take \*\*up to 1 minute\*\* (you may see "Database unavailable, try again in a minute").
> After that, everything is fast.

## Features

**Public main page**

* Hero slideshow (changes every 5 seconds, clickable 01 / 02 / 03), services, about us, opening hours
* "Get directions" opens Google Maps, sticky navbar with smooth scrolling
* Works on phones, tablets and computers

**Client** (signs up on the website)

* Adds his cars; the **VIN decoder** fills brand, model and year automatically (free NHTSA vPIC API)
* Books an appointment (car, service, date and time, notes) and follows its status
* Answers the owner when a new date is proposed (accept or decline)
* Sees his repair history and his total spent (finished repairs only)

**Owner** (one account, created once with a command, never from the website)

* Dashboard: clients, cars, repairs in progress, pending appointments, income this month
* Appointments: accept, reject or propose another date
* Repairs: record one or several repairs at once, mark them in progress or done
* Clients (with details and total spent), cars, search a car by plate number or VIN
* **Bin**: deleting moves an item to the bin, and it can be restored (soft delete)

## How it is built

```
React (Vite)  ──fetch + JWT──►  Express API  ──parameterized SQL──►  SQL Server
  client/                         server/                             database/
  Render Static Site              Render Web Service                  Azure SQL Database
```

|Part|Technologies|Made by|
|-|-|-|
|Front end (`client/`)|React 19, Vite, React Router, CSS (mobile-first), Vitest + Testing Library, ESLint|Georges Harb|
|Back end (`server/`)|Node.js, Express 5, bcrypt, JSON Web Tokens, helmet, express-rate-limit, mssql, Supertest|Ahmad Kaj|
|Database (`database/`)|Microsoft SQL Server / Azure SQL (tables, foreign keys, checks, indexes, soft delete)|Térésa Farhat|

```
client/     React app (pages, components, api.js, tests)     → see client/README.md
server/     Express API (routes, validation, security, tests) → see server/README.md (all endpoints)
database/   create\_tables.sql, create\_app\_user.sql, test\_queries.sql, schema diagrams
DEPLOYMENT.md   how the app was put online (Azure SQL Database + Render)
```

### Database

5 tables: `users`, `clients`, `cars`, `repairs`, `appointments`.

!\[Database schema](database/garage\_database\_schema.jpg)

* A user is either the owner or a client (`CHECK`), and only **one** owner can exist (filtered unique index).
* An appointment's car must belong to the same client (composite foreign key).
* Deleted clients, cars and repairs keep their row with a `deleted\_at` date (bin / restore).
* Indexes: unique email and VIN, plus `plate\_number` for the search.

## Security

* Passwords are hashed with **bcrypt**, never stored in clear text.
* Login returns a **JWT** (valid 1 day). Owner routes need the `owner` role, client routes the `client` role.
A client's id is read **from the token only**, so a client can never see another client's data.
* Every input is checked on the server (`server/validate.js`) and in the forms.
* Every SQL query uses **parameters** (`@name`), which protects against SQL injection.
* **helmet** security headers, **CORS** limited to our website, JSON body size limit.
* **Rate limit**: 10 wrong login attempts per 15 minutes, 10 sign ups per hour.
* **No secrets in Git**: `.env` files are ignored; `.env.example` shows the settings without real values.
Online, the values are in the Render settings.
* The online server logs in to the database with `garage\_app`, a user that can only read and write data.
* The Azure firewall only lets in our Render server (its outbound IP ranges) and our own computers.

## Tests

```bash
cd server \&\& npm test      # 28 tests: validation + API routes with Supertest (no database needed)
cd client \&\& npm test      # 14 tests: main page, slideshow, login draft, API helper
cd client \&\& npm run lint  # ESLint
```

The server tests check, among others: 401 without a token or with a fake one, 403 when a client opens owner
pages, 400 on bad input, the security headers, CORS, and the 429 after too many login attempts.

## Run it on your computer

Needs **Node.js 20+** and a SQL Server database (local SQL Server Express, or Azure SQL).

1. **Database**: create a database `GarageManagement` and run `database/create\_tables.sql` in it.
2. **Server**:

```bash
   cd server
   cp .env.example .env      # then fill it in (see the table below)
   npm install
   npm run create-owner -- owner@example.com AStrongPassword
   npm run dev               # http://localhost:3000
   ```

3. **Website** (in another terminal):

```bash
   cd client
   npm install
   npm run dev               # http://localhost:5173
   ```

`server/.env` settings:

|Key|Laptop with local SQL Server|Azure SQL|
|-|-|-|
|`DB\_SERVER`|`localhost`|`<server>.database.windows.net`|
|`DB\_NAME`|`GarageManagement`|`GarageManagement`|
|`DB\_USER` / `DB\_PASSWORD`|leave empty → **Windows Authentication** (needs ODBC Driver 18)|`garage\_app` and its password|
|`JWT\_SECRET`|any long random text|a different long random text|
|`FRONTEND\_URL`|`http://localhost:5173`|the website address(es), comma separated|

`server/db.js` picks the login type by itself: `DB\_USER` filled → SQL login, empty → Windows login.

## What we would build next

* Email or SMS reminder the day before an appointment
* Online payment of a finished repair
* Photos of the car attached to a repair

