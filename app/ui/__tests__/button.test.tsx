import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    
    const button = screen.getByRole('button', { name: /test/i });
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-blue-500'); // Default class
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes through button attributes', () => {
    render(<Button type="submit" disabled>Submit</Button>);
    
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });

  it('has correct default styles', () => {
    render(<Button>Styled Button</Button>);
    
    const button = screen.getByRole('button', { name: /styled button/i });
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('h-10');
  });
});
