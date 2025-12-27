import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './ui/Icon';
import { MovieSearchBar } from './MovieSearchBar';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';
import styles from './Header.module.css';

interface HeaderProps {
    mode?: 'discover' | 'watchstream';
    onModeChange?: (mode: 'discover' | 'watchstream') => void;
    discoverCount?: number;
    watchstreamsCount?: number;
}

export function Header({ mode, onModeChange, discoverCount, watchstreamsCount }: HeaderProps) {
    const { user } = useAuth();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!user) return null;

    // Only show mode tabs on home page
    const isHomePage = location.pathname === '/';

    const handleNotificationRead = () => {
        // Trigger bell to refresh count
        setRefreshTrigger(prev => prev + 1);
        setShowNotifications(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.leftSection}>
                    <Link to="/" className={styles.logoLink}>
                        <div className={styles.logoIcon}>
                            <Icon name="film" size="medium" />
                        </div>
                        <span className={styles.logoText}>Merlin</span>
                    </Link>

                    {isHomePage && mode && onModeChange && (
                        <div className={styles.modeTabs}>
                            <button
                                className={mode === 'discover' ? styles.modeTabActive : styles.modeTab}
                                onClick={() => onModeChange('discover')}
                            >
                                <Icon name="compass" size="medium" />
                                <span>Discover</span>
                                {discoverCount !== undefined && discoverCount > 0 && (
                                    <span className={styles.modeBadge}>{discoverCount}</span>
                                )}
                            </button>
                            <button
                                className={mode === 'watchstream' ? styles.modeTabActive : styles.modeTab}
                                onClick={() => onModeChange('watchstream')}
                            >
                                <Icon name="airplay" size="medium" />
                                <span>Watchstreams</span>
                                {watchstreamsCount !== undefined && watchstreamsCount > 0 && (
                                    <span className={styles.modeBadge}>{watchstreamsCount}</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.centerSection}>
                    <MovieSearchBar />
                </div>

                <div className={styles.userSection}>
                    <div className={styles.notificationWrapper}>
                        <NotificationBell
                            onClick={() => setShowNotifications(!showNotifications)}
                            refreshTrigger={refreshTrigger}
                        />
                        <NotificationDropdown
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            onNotificationRead={handleNotificationRead}
                        />
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name || 'User'}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                    </div>
                    {user.picture && (
                        <img src={user.picture} alt={user.name || ''} className={styles.avatar} />
                    )}
                </div>
            </div>
        </header>
    );
}
