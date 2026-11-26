import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn()); // the main page must not call the backend
});

function renderHome() {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

it('shows the fixed services without calling the backend', () => {
  renderHome();
  expect(screen.getByText('Oil change')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it('sends a visitor to /login when he clicks Book a visit', () => {
  renderHome();
  // two buttons: in the hero and in the Contact section
  for (const link of screen.getAllByRole('link', { name: 'BOOK A VISIT' })) {
    expect(link).toHaveAttribute('href', '/login');
  }
});

it('sends a logged-in client to /client when he clicks Book a visit', () => {
  localStorage.setItem('user', JSON.stringify({ id: 1, email: 'client@garage.com', role: 'client' }));
  renderHome();
  // two buttons: in the hero and in the Contact section
  for (const link of screen.getAllByRole('link', { name: 'BOOK A VISIT' })) {
    expect(link).toHaveAttribute('href', '/client');
  }
});

it('shows only LOG IN in the navbar for a visitor (sign up is reached from the login page)', () => {
  renderHome();
  expect(screen.getByRole('link', { name: 'LOG IN' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('link', { name: 'SIGN UP' })).toBeNull();
});
