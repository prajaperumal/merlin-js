import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { MovieSearchBar } from './MovieSearchBar';
import merlinLogo from '../assets/images/merlin-logo-transparent.png';
import styles from './Header.module.css';

interface HeaderProps {
    mode?: 'discover' | 'watchstream';
    onModeChange?: (mode: 'discover' | 'watchstream') => void;
    discoverCount?: number;
    watchstreamsCount?: number;
}

export function Header({ mode, onModeChange, discoverCount, watchstreamsCount }: HeaderProps) {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    // Only show mode tabs on home page
    const isHomePage = location.pathname === '/';

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Link to="/" className={styles.logoLink}>
                    <img src={merlinLogo} alt="Merlin" className={styles.logo} />
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
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name || 'User'}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                </div>
                {user.picture && (
                    <img src={user.picture} alt={user.name || ''} className={styles.avatar} />
                )}
                <Button variant="ghost" size="small" onClick={logout} className={styles.logoutButton}>
                    <Icon name="log-out" size="small" />
                </Button>
            </div>
        </header>
    );
}
