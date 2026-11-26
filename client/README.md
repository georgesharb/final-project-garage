# Garage Manager: frontend (React + Vite + React Router)

## Run it
```bash
npm install
npm run dev       # needs the backend running on http://localhost:3000 (see server/README.md)
npm test          # runs the tests (Vitest + Testing Library)
npm run lint      # ESLint
npm run build     # production build in dist/ (used by Vercel)
```

To point to another backend, copy `.env.example` to `.env` and change `VITE_API_URL`.

## How it's organized
| File | What it does |
|---|---|
| `src/api.js` | `api(path, method, body)` calls the backend with the token, plus login helpers (`saveLogin`, `getUser`, `logout`) and form drafts in localStorage (`loadDraft`, `saveDraft`, `clearDraft`; never the password) |
| `src/App.jsx` | All the routes (pages) of the app. Owner and client pages are loaded only when opened (`React.lazy` + `Suspense`) |
| `src/api.test.js` | Tests the API helper: token sent, server error shown, expired token → logout, server unreachable |
| `src/index.css` | Shared design tokens (colors, spacing, fonts) and the app pages, mobile-first |
| `vercel.json`, `public/_redirects` | Send every URL to React Router when online (refreshing `/owner/cars` gives no 404) |
| `src/pages/Home.jsx` | The public main page at `/`. Services are a fixed list in `src/homeData.js` (no API call) |
| `src/components/home/*` | Sections of the main page: navbar, hero slider, services, about, visit us (location + opening hours, Get directions button), footer with phone and email, footer, and their tests |
| `src/pages/Login.test.jsx` | Tests that the typed email stays after a reload, but never the password |
| `src/pages/Home.test.jsx` | Tests the main page: services shown without calling the backend, "Book a visit" goes to /login or /client |
| `src/homeData.js`, `src/home.css` | Fixed text of the main page (slides, steps, hours, address) and its styles. Every rule starts with `.home`, so it never changes the other pages |
| `src/components/ProtectedRoute.jsx` | Sends you to /login if you're not logged in or have the wrong role |
| `src/components/Layout.jsx` | Owner menu + current page: a top bar on phones, a sidebar from 768px |
| `src/pages/Login.jsx`, `Register.jsx` | Login with a Client / Owner choice; Sign up is for clients only |
| `src/components/RoleChoice.jsx` | The Client / Owner buttons |
| `src/components/DeleteButton.jsx` | Delete needs two clicks |
| `src/pages/owner/*` | Dashboard, Search, Clients (+ details; view, edit, delete only), Cars, Repairs (several at once), Appointments, Bin |
| `src/pages/client/ClientHome.jsx` | The client's ONE page, made of 4 sections: Info (read only), Cars, Appointments, Repairs |

## The pattern every CRUD page follows
1. `useState` for the list, the form, and `editId` (`null` = adding, a number = editing).
2. `useEffect` loads the list when the page opens (and again when a filter or `refresh` changes; an `ignore` flag drops an old answer).
3. Submit: if `editId` is set, send `PUT`, otherwise send `POST`. Then reload the list.
4. The Edit button fills the form. The Delete button (two clicks) sends `DELETE`, which moves the item to the bin.
5. Errors from the backend (`{ error }`) are shown in red.
