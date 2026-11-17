import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import Services from './Services';

const services = [
  { id: 1, name: 'Oil change', description: 'Engine oil and filter replacement' },
  { id: 2, name: 'Brakes', description: 'Pads, discs and brake fluid' },
];

it('shows every service that comes from the API', () => {
  render(<Services services={services} loading={false} error="" />);
  expect(screen.getByText('Oil change')).toBeInTheDocument();
  expect(screen.getByText('Brakes')).toBeInTheDocument();
});

it('shows a loading message while waiting', () => {
  render(<Services services={[]} loading={true} error="" />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('shows the error instead of the list when loading failed', () => {
  render(<Services services={[]} loading={false} error="Could not load" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
});
