import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
    it('renders correctly with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        screen.getByText('Click me').click();
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Click me</Button>);
        expect(screen.getByText('Click me')).toBeDisabled();
    });
});
