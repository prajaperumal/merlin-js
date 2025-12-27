import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';
import { api } from '../services/api';
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
    onClick: () => void;
    refreshTrigger?: number;
}

export function NotificationBell({ onClick, refreshTrigger }: NotificationBellProps) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const loadUnreadCount = async () => {
        try {
            const count = await api.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    return (
        <button className={styles.bellButton} onClick={onClick} aria-label="Notifications">
            <Icon name="bell" size="medium" />
            {unreadCount > 0 && (
                <span className={styles.badge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}
