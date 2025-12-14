import { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    clickable?: boolean;
    glass?: boolean;
}

export function Card({ children, clickable, glass, className = '', ...props }: CardProps) {
    const classes = [
        styles.card,
        clickable && styles.clickable,
        glass && styles.glass,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}
