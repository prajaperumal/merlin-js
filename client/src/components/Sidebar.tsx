import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Watchstream, Circle } from '../types';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import merlinLogo from '../assets/images/merlin-logo-transparent.png';
import styles from './Sidebar.module.css';

export function Sidebar() {
    const { user, logout } = useAuth();
    const [watchstreamsExpanded, setWatchstreamsExpanded] = useState(true);
    const [circlesExpanded, setCirclesExpanded] = useState(true);
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [circles, setCircles] = useState<{ owned: Circle[]; member: Circle[] }>({ owned: [], member: [] });

    useEffect(() => {
        loadWatchstreams();
        loadCircles();
    }, []);

    const loadWatchstreams = async () => {
        try {
            const data = await api.getWatchstreams();
            setWatchstreams(data);
        } catch (err) {
            console.error('Failed to load watchstreams:', err);
        }
    };

    const loadCircles = async () => {
        try {
            const data = await api.getCircles();
            setCircles({ owned: data.owned, member: data.member });
        } catch (err) {
            console.error('Failed to load circles:', err);
        }
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <Link to="/" className={styles.logoLink}>
                    <img src={merlinLogo} alt="Merlin" className={styles.logo} />
                </Link>
            </div>

            <nav className={styles.nav}>

                {/* Watchstreams Section */}
                <div>
                    <div
                        className={`${styles.navLink} ${watchstreamsExpanded ? styles.navLinkExpanded : ''}`}
                        onClick={() => setWatchstreamsExpanded(!watchstreamsExpanded)}
                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <Icon name="airplay" size="medium" />
                            <span>Watchstreams</span>
                            {watchstreams.length > 0 && (
                                <span className={styles.badge}>{watchstreams.length}</span>
                            )}
                        </div>
                        <Icon name="chevron-down" size="small" className={styles.chevron} />
                    </div>
                    {watchstreamsExpanded && (
                        <div className={styles.watchstreamsList}>
                            {watchstreams.length > 0 ? (
                                watchstreams.slice(0, 5).map((ws) => (
                                    <Link
                                        key={ws.id}
                                        to={`/watchstreams/${ws.id}`}
                                        className={styles.watchstreamItem}
                                    >
                                        <Icon name="film" size="small" className={styles.watchstreamIcon} />
                                        <span className={styles.watchstreamName}>{ws.name}</span>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <Icon name="airplay" size="large" />
                                    <p>No watchstreams</p>
                                    <Link to="/watchstreams" className={styles.emptyLink}>Create your first</Link>
                                </div>
                            )}
                            {watchstreams.length > 0 && (
                                <Link to="/watchstreams" className={styles.viewAllLink}>
                                    View All Watchstreams
                                    <Icon name="chevron-right" size="small" />
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Circles Section */}
                <div>
                    <div
                        className={`${styles.navLink} ${circlesExpanded ? styles.navLinkExpanded : ''}`}
                        onClick={() => setCirclesExpanded(!circlesExpanded)}
                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <Icon name="users-group" size="medium" />
                            <span>Circles</span>
                            {[...circles.owned, ...circles.member].length > 0 && (
                                <span className={styles.badge}>{[...circles.owned, ...circles.member].length}</span>
                            )}
                        </div>
                        <Icon name="chevron-down" size="small" className={styles.chevron} />
                    </div>
                    {circlesExpanded && (
                        <div className={styles.circlesList}>
                            {[...circles.owned, ...circles.member].length > 0 ? (
                                [...circles.owned, ...circles.member].slice(0, 5).map((circle) => (
                                    <Link
                                        key={circle.id}
                                        to={`/circles/${circle.id}`}
                                        className={styles.circleItem}
                                    >
                                        <div className={styles.circleIcon}>
                                            {circle.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={styles.circleInfo}>
                                            <div className={styles.circleName}>{circle.name}</div>
                                            <div className={styles.circleMembers}>
                                                {circle.memberCount || 1} {(circle.memberCount || 1) === 1 ? 'member' : 'members'}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <Icon name="users-group" size="large" />
                                    <p>No circles yet</p>
                                    <Link to="/circles" className={styles.emptyLink}>Create your first circle</Link>
                                </div>
                            )}
                            {[...circles.owned, ...circles.member].length > 0 && (
                                <Link to="/circles" className={styles.viewAllLink}>
                                    View All Circles
                                    <Icon name="chevron-right" size="small" />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {user && (
                <div className={styles.footer}>
                    <div className={styles.user}>
                        {user.picture && (
                            <img src={user.picture} alt={user.name || ''} className={styles.avatar} />
                        )}
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.name || 'User'}</div>
                            <div className={styles.userEmail}>{user.email}</div>
                        </div>
                    </div>
                    <Button variant="ghost" size="small" onClick={logout} className={styles.logoutButton}>
                        <Icon name="log-out" size="small" />
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
}
