// Everything that talks to the backend goes through this file.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Usage: await api('/owner/cars')              -> GET
//        await api('/owner/cars', 'POST', car) -> POST with a JSON body
export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('token');

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: token
        ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
        : { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    // fetch fails like this only when the backend is not running / not reachable
    throw new Error('We cannot reach the server right now. Please try again in a moment.');
  }

  // Our API always answers JSON, but a host error page may not: don't crash on it
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  // 401 = token expired (after 1 day) or invalid, 403 = wrong role (a client on an owner page):
  // log out and go back to the login page.
  // (Not for /auth/login itself: a wrong password must just show the message.)
  if ((res.status === 401 || res.status === 403) && token && !path.startsWith('/auth/')) {
    logout();
    window.location.assign('/login');
  }

  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

/* ---------- Login helpers (token + user saved in localStorage) ---------- */

export function saveLogin(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Reads the inside of a JWT (the middle part, base64). It does NOT check the signature:
// only the server can do that. We use it to know the role and the expiry date.
function readToken(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part)); // { id, role, clientId, exp }
  } catch {
    return null; // not a real token
  }
}

// The logged-in user, or null. The role comes from the token (not from what is saved
// next to it), and an expired token logs out right away.
export function getUser() {
  const token = localStorage.getItem('token');
  const payload = token ? readToken(token) : null;
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    logout();
    return null;
  }
  const saved = JSON.parse(localStorage.getItem('user')) || {};
  return { ...saved, role: payload.role };
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/* ---------- Date helpers ---------- */
// We show dates exactly as stored in the database (no timezone shifting).
export const showDate = (value) => (value ? value.slice(0, 10) : '');
export const showDateTime = (value) => (value ? value.slice(0, 16).replace('T', ' ') : '');

/* ---------- Email rule ---------- */
// name@domain.ending, the ending (com, net, lb...) needs at least 2 letters.
// Used as <input pattern={EMAIL_PATTERN}> so the browser refuses "ahmad@gmail".
export const EMAIL_PATTERN = '[^\\s@]+@[^\\s@]+\\.[a-zA-Z]{2,}';
export const EMAIL_HINT = 'Example: email@example.com';

/* ---------- Phone rule ---------- */
// only numbers (spaces and a + at the start are allowed), same rule as the server
export const PHONE_PATTERN = '\\+?[0-9 ]{7,20}';
export const PHONE_HINT = 'Only numbers, example: 03 123 456';

/* ---------- VIN decoder ---------- */
// Asks our backend (which asks the free NHTSA API) for brand, model and year.
// Fills brand, model and year from a VIN (through our server, which asks NHTSA)
export async function decodeVin(vin) {
  return api('/vin/' + encodeURIComponent(vin.trim()));
}


/* ---------- Form drafts (what you typed stays after a reload) ---------- */
// We never save the password in localStorage.
export function loadDraft(key, emptyForm) {
  const saved = JSON.parse(localStorage.getItem(key)); // null if nothing saved
  return { ...emptyForm, ...saved };
}

export function saveDraft(key, form) {
  const { password, ...rest } = form; // keep everything except the password
  localStorage.setItem(key, JSON.stringify(rest));
}

export function clearDraft(key) {
  localStorage.removeItem(key);
}
