import { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
    const classes = [
        styles.input,
        error && styles.error,
        className,
    ].filter(Boolean).join(' ');

    return <input className={classes} {...props} />;
}
