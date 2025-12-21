import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            window.addEventListener('keydown', handleEscape);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEscape);
            };
        }

        document.body.style.overflow = 'unset';
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
}
