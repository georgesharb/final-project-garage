// Everything that talks to the backend goes through this file.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Usage: await api('/owner/cars')              -> GET
//        await api('/owner/cars', 'POST', car) -> POST with a JSON body
export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('token');

  // Demo mode: no backend needed, a fake server answers instead (see src/demo)
  if (import.meta.env.VITE_DEMO === 'true') {
    const { fakeServer } = await import('./demo/fakeServer.js');
    return fakeServer(path, method, body, token);
  }

  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/* ---------- Login helpers (token + user saved in localStorage) ---------- */

export function saveLogin(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user')); // null if not logged in
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/* ---------- Date helpers ---------- */
// We show dates exactly as stored in the database (no timezone shifting).
export const showDate = (value) => (value ? value.slice(0, 10) : '');
export const showDateTime = (value) => (value ? value.slice(0, 16).replace('T', ' ') : '');

/* ---------- Confirm before deleting ---------- */
export function confirmDelete(message) {
  // The demo page runs in a sandbox where confirm() is blocked, so it skips the question
  if (import.meta.env.VITE_DEMO === 'true') return true;
  return window.confirm(message);
}
