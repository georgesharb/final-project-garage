# How GTA V Garage is online (Milestone 4)

| Part | Folder | Service | Address |
|---|---|---|---|
| Database | `database/` | **Azure SQL Database** (Azure for Students, free offer) | `gtav-garage-sql.database.windows.net` |
| Back end (API) | `server/` | **Render Web Service** (free) | https://gtav-garage-api.onrender.com |
| Front end (React) | `client/` | **Render Static Site** (free) | https://gtav-garage.onrender.com |

Order: **database → back end → front end**, because each one needs the address of the one before.

> On our laptops the server logs in to SQL Server with our **Windows account**.
> Online there is no Windows account (Render runs Linux), so it uses a **SQL login** (`garage_app` + password).
> `server/db.js` chooses automatically: `DB_USER` filled → SQL login, `DB_USER` empty → Windows login.

---

## 1. Database: Azure SQL Database

1. Sign up at **azure.microsoft.com/free/students** with the university email (no credit card).
2. Portal → **SQL databases → + Create**. The banner **"Free offer applied"** must be shown.
   - Resource group `garage-rg`, database name `GarageManagement`
   - Server: new, `gtav-garage-sql`, **France Central**, **SQL authentication**, admin login `garageadmin`
   - **Overage billing: Disabled** → when the free monthly amount is used, the database pauses instead of costing money.
3. Server **gtav-garage-sql → Security → Networking**:
   - Public network access: **Selected networks**
   - **+ Add your client IPv4 address** (so we can use the Query editor / SSMS from our laptop)
   - **+ Add a firewall rule** for each **Render outbound range** (Render → the API service → **Connect → Outbound**).
     For Frankfurt: `74.220.51.0 – 74.220.51.255` and `74.220.59.0 – 74.220.59.255`.
     Render is **not** an Azure service, so "Allow Azure services" alone does not let it in.
4. Database → **Query editor** (log in as `garageadmin`), run in order:
   1. `database/create_tables.sql`
   2. `database/create_app_user.sql` with a strong password of our choice (never written in the repo).

---

## 2. Back end: Render Web Service

**+ New → Web Service** → public repository `https://github.com/georgesharb/final-project-garage`

| Setting | Value |
|---|---|
| Name | `gtav-garage-api` |
| Branch | `main` |
| Region | **Frankfurt** (closest to the Azure database) |
| Root Directory | `server` |
| Build / Start | `npm install` / `npm start` |
| Instance | **Free** |

**Environment variables** (they replace the `.env` file, which is never on GitHub):

| Key | Value |
|---|---|
| `DB_SERVER` | `gtav-garage-sql.database.windows.net` |
| `DB_NAME` | `GarageManagement` |
| `DB_USER` | `garage_app` |
| `DB_PASSWORD` | the `garage_app` password |
| `JWT_SECRET` | **Generate** button (random, different from the laptop) |
| `FRONTEND_URL` | `https://gtav-garage.onrender.com,http://localhost:5173` |
| `NODE_VERSION` | `22` |

Check: https://gtav-garage-api.onrender.com shows *"Garage Management API is running!"*.

**The owner account** is never created from the website. It was created once from a laptop with
`npm run create-owner -- <email> <password>`, with `server/.env` pointing to the Azure database.

---

## 3. Front end: Render Static Site

**+ New → Static Site** → same repository

| Setting | Value |
|---|---|
| Name | `gtav-garage` |
| Branch | `main` |
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment variable | `VITE_API_URL` = `https://gtav-garage-api.onrender.com/api` |

**Redirects/Rewrites → Add Rule**: Source `/*`, Destination `/index.html`, Action **Rewrite**.
Without it, refreshing a page like `/owner/cars` gives "Not Found", because that file does not exist:
React Router handles the address in the browser.
(`client/vercel.json` and `client/public/_redirects` do the same thing on Vercel and Netlify.)

---

## 4. Problems we met (and the fix)

| Problem | Cause | Fix |
|---|---|---|
| API: "Failed to connect … in 15000ms" | Azure firewall blocked Render | Add Render's outbound IP ranges to the firewall |
| API: "Login failed for user 'garage_app'" | `DB_PASSWORD` typed differently on Render | Retype it (no spaces, no quotes) and redeploy |
| Render deploy stuck on "Building" with an empty log | busy free build queue | Cancel → Manual Deploy → Deploy latest commit |
| First request after a while is slow or says "Database unavailable" | free API and database sleep | Wait about 1 minute, then it is fast |

---

## 5. Final check (done on the live site)

- [x] Main page, slideshow, links, Google Maps directions
- [x] Refresh on `/owner/cars` → the app loads (no "Not Found")
- [x] Client: sign up, log in, add a car with the VIN decoder, book an appointment, repair history and total spent
- [x] Owner: dashboard, accept an appointment, add repairs (done / in progress), search by plate, Bin delete and restore
- [x] Owner pages refused without a token (401); security headers present
- [x] Phone size: menus and tables stay inside the screen
- [x] No errors in the browser console

**Before showing it to someone:** open the API link first and wait until it answers, then the website.
