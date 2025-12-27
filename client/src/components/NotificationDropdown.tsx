import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Notification } from '../types';
import { Icon } from './ui/Icon';
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onNotificationRead: () => void;
}

export function NotificationDropdown({ isOpen, onClose, onNotificationRead }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await api.getNotifications();
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Don't navigate if clicking on action buttons
        if (processingId === notification.id) return;

        // Mark as read
        if (!notification.read) {
            await api.markNotificationAsRead(notification.id);
            onNotificationRead();
        }

        // Navigate if there's a link
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const handleAcceptInvitation = async (notification: Notification, event: React.MouseEvent) => {
        event.stopPropagation();
        setProcessingId(notification.id);

        try {
            const circleId = notification.metadata?.circleId;
            if (circleId) {
                await api.acceptInvitation(circleId);
                // Remove notification from list
                setNotifications(notifications.filter(n => n.id !== notification.id));
                onNotificationRead();
            }
        } catch (error) {
            console.error('Failed to accept invitation:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeclineInvitation = async (notification: Notification, event: React.MouseEvent) => {
        event.stopPropagation();
        setProcessingId(notification.id);

        try {
            const circleId = notification.metadata?.circleId;
            if (circleId) {
                await api.declineInvitation(circleId);
                // Remove notification from list
                setNotifications(notifications.filter(n => n.id !== notification.id));
                onNotificationRead();
            }
        } catch (error) {
            console.error('Failed to decline invitation:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkAllRead = async () => {
        await api.markAllNotificationsAsRead();
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        onNotificationRead();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'circle_invite':
                return 'user-add';
            case 'invite_accepted':
                return 'check-circle';
            case 'movie_recommended':
                return 'film';
            case 'comment_added':
                return 'message-circle';
            default:
                return 'info';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderActionButtons = (notification: Notification) => {
        if (notification.type === 'circle_invite') {
            return (
                <div className={styles.actions}>
                    <button
                        className={styles.acceptButton}
                        onClick={(e) => handleAcceptInvitation(notification, e)}
                        disabled={processingId === notification.id}
                    >
                        Accept
                    </button>
                    <button
                        className={styles.declineButton}
                        onClick={(e) => handleDeclineInvitation(notification, e)}
                        disabled={processingId === notification.id}
                    >
                        Decline
                    </button>
                </div>
            );
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.header}>
                <h3 className={styles.title}>Notifications</h3>
                {notifications.some(n => !n.read) && (
                    <button className={styles.markAllButton} onClick={handleMarkAllRead}>
                        Mark all read
                    </button>
                )}
            </div>

            <div className={styles.notificationList}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className={styles.empty}>
                        <Icon name="bell" size={48} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon name={getNotificationIcon(notification.type)} size="medium" />
                            </div>
                            <div className={styles.content}>
                                <div className={styles.message}>{notification.message}</div>
                                <div className={styles.time}>{formatTime(notification.createdAt)}</div>
                                {renderActionButtons(notification)}
                            </div>
                            {!notification.read && <div className={styles.unreadDot} />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
