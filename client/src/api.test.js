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
