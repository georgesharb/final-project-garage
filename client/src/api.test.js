// Tests of the API helper: fetch is replaced by a fake (vi.fn), no server needed.
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, saveLogin, getUser } from './api';

beforeEach(() => {
  localStorage.clear();
  // window.location.assign cannot really change page in the tests: replace it by a fake
  vi.stubGlobal('location', { ...window.location, assign: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

// a fake answer from the server
function fakeFetch(status, body) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  }));
}

it('sends the token and returns the data', async () => {
  saveLogin('abc', { role: 'owner' });
  fakeFetch(200, [{ id: 1 }]);

  const data = await api('/owner/cars');

  expect(data).toEqual([{ id: 1 }]);
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
});

it('shows the error message sent by the server', async () => {
  fakeFetch(400, { error: 'VIN must be exactly 17 characters' });
  await expect(api('/me/cars', 'POST', {})).rejects.toThrow('VIN must be exactly 17 characters');
});

it('logs out and goes to the login page when the token expired', async () => {
  saveLogin('old-token', { role: 'client' });
  fakeFetch(401, { error: 'Invalid or expired token' });

  await expect(api('/me')).rejects.toThrow('Invalid or expired token');
  expect(getUser()).toBe(null);
  expect(window.location.assign).toHaveBeenCalledWith('/login');
});

it('a wrong password on the login page does not redirect', async () => {
  fakeFetch(401, { error: 'Wrong email or password' });
  await expect(api('/auth/login', 'POST', {})).rejects.toThrow('Wrong email or password');
  expect(window.location.assign).not.toHaveBeenCalled();
});

it('gives a clear message when the server cannot be reached', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  await expect(api('/me')).rejects.toThrow('We cannot reach the server right now');
});

// a token with the given role, expiring in "seconds" (negative = already expired)
function fakeToken(role, seconds) {
  const payload = btoa(JSON.stringify({ id: 1, role, exp: Math.floor(Date.now() / 1000) + seconds }));
  return 'header.' + payload + '.signature';
}

it('takes the role from the token, not from the saved user', () => {
  saveLogin(fakeToken('client', 3600), { email: 'a@b.com', role: 'owner' }); // someone edited "user"
  expect(getUser().role).toBe('client');
});

it('is logged out when there is no token or the token expired', () => {
  localStorage.setItem('user', JSON.stringify({ role: 'owner' })); // no token at all
  expect(getUser()).toBe(null);

  saveLogin(fakeToken('owner', -60), { role: 'owner' }); // expired 1 minute ago
  expect(getUser()).toBe(null);
  expect(localStorage.getItem('token')).toBe(null);
});

it('logs out when a client token is used on an owner page (403)', async () => {
  saveLogin(fakeToken('client', 3600), { role: 'client' });
  fakeFetch(403, { error: 'Access denied' });
  await expect(api('/owner/clients')).rejects.toThrow('Access denied');
  expect(window.location.assign).toHaveBeenCalledWith('/login');
});
