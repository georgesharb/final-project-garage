# Putting GTA V Garage online (Milestone 4)

Three free services, one per part of the project:

| Part | Folder | Service | Free plan |
|---|---|---|---|
| Database | `database/` | **Azure SQL Database** (Azure for Students) | free offer: 32 GB, pauses when nobody uses it |
| Back end (API) | `server/` | **Render** (Web Service) | sleeps after 15 min without visits, wakes in about 1 min |
| Front end (React) | `client/` | **Vercel** (or Netlify) | free for personal projects |

Order: **database → back end → front end**, because each one needs the address of the one before.

> Why not our laptop setup? On the laptop the server logs in to SQL Server with our **Windows account**.
> Online there is no Windows account (Render runs Linux), so the server uses a **SQL login** (username + password).
> `server/db.js` chooses automatically: `DB_USER` filled → SQL login, `DB_USER` empty → Windows login.

---

## 1. Database: Azure SQL (Térésa)

1. Go to **azure.microsoft.com/free/students** and sign up with the **USJ email** (no credit card, $100 credit for 12 months).
2. In the Azure portal: **Create a resource → SQL Database**.
   - Look for the banner **"Want to try Azure SQL Database for free?" → Apply offer**.
   - Resource group: new, `garage-rg`. Database name: `GarageManagement`.
   - Server: **Create new** → a name (example `gtav-garage-sql`), a location near Lebanon (example *France Central*).
   - Authentication: **Use SQL authentication**. Write down the admin login and password (only for us, not for the website).
   - When the free limit is reached: choose **"Auto-pause the database until next month"** (so it never costs money).
3. **Networking** tab:
   - Connectivity: **Public endpoint**.
   - **Allow Azure services and resources to access this server: Yes** (Render needs it).
   - **Add current client IP address: Yes** (so SSMS on our laptop can connect).
4. Create, wait 2–3 minutes.
5. Open **SSMS** on the laptop and connect:
   - Server name: `gtav-garage-sql.database.windows.net`
   - Authentication: **SQL Server Authentication**, the admin login and password from step 2.
6. In SSMS, select the **GarageManagement** database (not *master*) and run, in this order:
   1. `database/create_tables.sql`
   2. `database/create_app_user.sql` (change the password inside it first, and write it down).

The website will log in as `garage_app`, which can only read and write data (it cannot drop tables).

> If the database was paused, the first request takes up to a minute: the API answers
> "Database unavailable, try again in a minute" (503) and works on the next try.

---

## 2. Back end: Render (Ahmad)

1. Go to **render.com**, sign up **with GitHub**.
2. **New → Web Service** → choose our repository `final-project-garage`, branch `main`.
3. Settings:
   - Root Directory: `server`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance type: **Free**
4. **Environment Variables** (these replace the `.env` file, which is never on GitHub):

   | Key | Value |
   |---|---|
   | `DB_SERVER` | `gtav-garage-sql.database.windows.net` |
   | `DB_NAME` | `GarageManagement` |
   | `DB_USER` | `garage_app` |
   | `DB_PASSWORD` | the password from `create_app_user.sql` |
   | `JWT_SECRET` | a **new** long random text (not the one from the laptop) |
   | `FRONTEND_URL` | `http://localhost:5173` for now (we change it in step 3) |

   To make a random secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
5. **Create Web Service**. After the build, open `https://<name>.onrender.com/` → you should see
   *"Garage Management API is running!"*.

### Create the owner account online (once)

The owner is never created from the website. On the laptop, in PowerShell, in the `server` folder
(these values only last while this window is open; `.env` is not changed):

```powershell
$env:DB_SERVER="gtav-garage-sql.database.windows.net"
$env:DB_USER="garage_app"
$env:DB_PASSWORD="the garage_app password"
npm run create-owner -- owner@example.com AStrongPassword
```

---

## 3. Front end: Vercel (Georges)

1. Go to **vercel.com**, sign up **with GitHub** → **Add New → Project** → our repository.
2. Settings:
   - Root Directory: `client`
   - Framework: **Vite** (found automatically). Build: `npm run build`, output: `dist`.
   - Environment Variable: `VITE_API_URL` = `https://<name>.onrender.com/api`
3. **Deploy**. Vercel gives an address like `https://gtav-garage.vercel.app`.
4. Back in **Render → Environment**: change `FRONTEND_URL` to
   `https://gtav-garage.vercel.app,http://localhost:5173` (both, separated by a comma) → Save (Render restarts).

`client/vercel.json` makes Vercel send every address (like `/owner/cars`) to React Router,
so refreshing a page does not give a 404. (`client/public/_redirects` does the same on Netlify.)

---

## 4. Final check (everyone, on a phone with mobile data, not the USJ Wi-Fi)

Open the Render address once first, wait until it answers (it may be asleep), then the Vercel address.

- [ ] Main page: slideshow, SERVICES / ABOUT US / VISIT US links, "Get directions" opens Google Maps
- [ ] Sign up a new client → log in as client
- [ ] Client: add a car (try the VIN decoder), book an appointment, see the repair history
- [ ] Log in as owner → the new appointment is in **Appointments** → accept it
- [ ] Owner: add a repair for that car, mark it **done** → the dashboard income and the client's "Total spent" change
- [ ] Owner: search by plate number, delete a car → it is in the **Bin** → restore it
- [ ] Refresh the page on `/owner/cars` → no 404
- [ ] Wrong password 11 times → "Too many login attempts" (rate limit works)
- [ ] Browser console (F12): no red errors
- [ ] Phone: owner menu is a bar at the top, tables scroll sideways inside their box

**Before the presentation:** open both addresses 5 minutes early so Render and Azure are awake.

---

## Tests to run before pushing

```bash
cd server && npm test            # validation + API route tests (no database needed)
cd client && npm test            # React component + API helper tests
cd client && npm run lint        # ESLint: must show no errors
cd client && npm run build       # must finish without errors
```

With the real database (on the laptop, SQL Server running): repeat the checklist of section 4 at
`http://localhost:5173`.
