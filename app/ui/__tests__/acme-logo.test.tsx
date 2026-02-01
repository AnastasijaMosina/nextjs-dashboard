import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AcmeLogo from '../acme-logo';

describe('AcmeLogo Component', () => {
  it('renders the Acme text', () => {
    render(<AcmeLogo />);
    
    const logoText = screen.getByText('Acme');
    expect(logoText).toBeInTheDocument();
  });

  it('has correct text size class', () => {
    render(<AcmeLogo />);
    
    const logoText = screen.getByText('Acme');
    expect(logoText).toHaveClass('text-[44px]');
  });

  it('renders the globe icon', () => {
    const { container } = render(<AcmeLogo />);
    
    // GlobeAltIcon renders as an SVG
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-12');
    expect(icon).toHaveClass('w-12');
    expect(icon).toHaveClass('rotate-[15deg]');
  });

  it('has white text styling', () => {
    const { container } = render(<AcmeLogo />);
    
    const logoContainer = container.firstChild;
    expect(logoContainer).toHaveClass('text-white');
  });
});
