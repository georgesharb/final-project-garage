import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import Services from './Services';
import { services } from '../../homeData';

it('shows every service of the fixed list', () => {
  render(<Services />);
  for (const s of services) {
    expect(screen.getByText(s.name)).toBeInTheDocument();
  }
});
