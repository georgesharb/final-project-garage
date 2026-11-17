# Garage Manager: frontend (React + Vite + React Router)

## Run it
```bash
npm install
npm run dev       # real app: needs the backend running on http://localhost:5000
npm run demo      # demo: works WITHOUT backend/database (fake data in memory)
npm test          # runs the automated tests (Vitest + Testing Library)
```
Demo accounts: `owner@garage.com / owner123` and `client@garage.com / client123`

To point to another backend, copy `.env.example` to `.env` and change `VITE_API_URL`.

## How it's organized
| File | What it does |
|---|---|
| `src/api.js` | `api(path, method, body)` calls the backend with the token, plus login helpers (`saveLogin`, `getUser`, `logout`) |
| `src/App.jsx` | All the routes (pages) of the app |
| `src/pages/Home.jsx` | The public main page at `/`. Loads the services from `GET /api/services` |
| `src/components/home/*` | The sections of the main page: navbar, hero (slider), services, about, location (map), footer, and their tests |
| `src/homeData.js`, `src/home.css` | Fixed text of the main page (slides, steps, hours, address) and its styles. Every rule starts with `.home` so it never changes the other pages |
| `src/components/ProtectedRoute.jsx` | Sends you to /login if you're not logged in or have the wrong role |
| `src/components/Layout.jsx` | Sidebar + current page (used by owner and client) |
| `src/pages/Login.jsx`, `Register.jsx`, `OwnerSetup.jsx` | Login (both roles), client sign-up, one-time owner setup |
| `src/pages/owner/*` | Dashboard, Search, Clients (+ details), Cars, Repairs, Appointments |
| `src/pages/client/*` | Profile, My cars, My appointments |
| `src/demo/fakeServer.js` | Demo only: a fake backend in memory. Not in the real build |

## The pattern every CRUD page follows
1. `useState` for the list, the form, and `editId` (`null` = adding, a number = editing).
2. `useEffect` loads the list when the page opens.
3. Submit: if `editId` is set, send `PUT`, otherwise send `POST`. Then reload the list.
4. The Edit button fills the form. The Delete button sends `DELETE`.
5. Errors from the backend (`{ message }`) are shown in red.
