import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { it, expect } from 'vitest';
import Hero from './Hero';

const slides = [
  { id: 'a', title: 'First title', text: 'First text' },
  { id: 'b', title: 'Second title', text: 'Second text' },
];

// Hero contains a <Link>, so it needs a router around it
function renderHero() {
  render(
    <MemoryRouter>
      <Hero slides={slides} phone="123" bookLink="/client/appointments" />
    </MemoryRouter>
  );
}

it('shows the next slide when the next arrow is clicked', async () => {
  renderHero();
  expect(screen.getByText('First title')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText('Second title')).toBeInTheDocument();
});

it('goes back to the first slide after the last one', async () => {
  renderHero();
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  await userEvent.click(screen.getByRole('button', { name: /next/i }));
  expect(screen.getByText('First title')).toBeInTheDocument();
});
