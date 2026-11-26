import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, beforeEach } from 'vitest';
import Login from './Login';

beforeEach(() => localStorage.clear());

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

it('keeps the typed email after a reload, but never the password', async () => {
  renderLogin();
  await userEvent.type(document.querySelector('input[name="email"]'), 'maya@gmail.com');
  await userEvent.type(document.querySelector('input[name="password"]'), 'Secret123');

  cleanup();      // like closing the page
  renderLogin();  // like opening it again

  expect(document.querySelector('input[name="email"]').value).toBe('maya@gmail.com');
  expect(document.querySelector('input[name="password"]').value).toBe('');
  expect(localStorage.getItem('loginDraft')).not.toContain('Secret123');
});
