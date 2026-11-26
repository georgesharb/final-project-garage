import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import Hero from './Hero';

const slides = [
  { id: 'a', title: 'First title', text: 'First text' },
  { id: 'b', title: 'Second title', text: 'Second text' },
];

// Fake timers: the test moves the clock forward instead of waiting 5 real seconds
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// Hero contains a <Link>, so it needs a router around it
function renderHero() {
  render(
    <MemoryRouter>
      <Hero slides={slides} phone="123" bookLink="/client" />
    </MemoryRouter>
  );
}

it('shows the next slide by itself after 5 seconds', () => {
  renderHero();
  expect(screen.getByText('First title')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('Second title')).toBeInTheDocument();
});

it('goes back to the first slide after the last one', () => {
  renderHero();
  act(() => vi.advanceTimersByTime(5000));
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('First title')).toBeInTheDocument();
});

it('shows a slide when its number is clicked', () => {
  renderHero();
  fireEvent.click(screen.getByRole('button', { name: 'Show slide 2' }));
  expect(screen.getByText('Second title')).toBeInTheDocument();
});
