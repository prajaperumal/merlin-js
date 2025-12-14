import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Watchstream, Circle } from '../types';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import merlinLogo from '../assets/images/merlin-logo.png';
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
                        className={styles.navLink}
                        onClick={() => setWatchstreamsExpanded(!watchstreamsExpanded)}
                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <Icon name="airplay" size="medium" />
                            <span>Watchstreams</span>
                        </div>
                        <Icon name={watchstreamsExpanded ? 'chevron-down' : 'chevron-right'} size="small" />
                    </div>
                    {watchstreamsExpanded && (
                        <div style={{ marginLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-sm)' }}>
                            {watchstreams.length > 0 ? (
                                watchstreams.slice(0, 5).map((ws) => (
                                    <Link
                                        key={ws.id}
                                        to={`/watchstreams/${ws.id}`}
                                        className={styles.subNavLink}
                                        style={{
                                            display: 'block',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: 'var(--font-size-sm)',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'all var(--transition-fast)',
                                            marginBottom: 'var(--spacing-xs)',
                                        }}
                                    >
                                        {ws.name}
                                    </Link>
                                ))
                            ) : (
                                <div style={{
                                    padding: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-tertiary)'
                                }}>
                                    No watchstreams
                                </div>
                            )}
                            <Link
                                to="/watchstreams"
                                style={{
                                    display: 'block',
                                    padding: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-primary)',
                                    marginTop: 'var(--spacing-sm)',
                                }}
                            >
                                + View All
                            </Link>
                        </div>
                    )}
                </div>

                {/* Circles Section */}
                <div>
                    <div
                        className={styles.navLink}
                        onClick={() => setCirclesExpanded(!circlesExpanded)}
                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <Icon name="users-group" size="medium" />
                            <span>Circles</span>
                        </div>
                        <Icon name={circlesExpanded ? 'chevron-down' : 'chevron-right'} size="small" />
                    </div>
                    {circlesExpanded && (
                        <div style={{ marginLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-sm)' }}>
                            {circles.owned.length > 0 && (
                                <div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-tertiary)',
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                    }}>
                                        Owned
                                    </div>
                                    {circles.owned.slice(0, 5).map((circle) => (
                                        <Link
                                            key={circle.id}
                                            to={`/circles/${circle.id}`}
                                            className={styles.subNavLink}
                                            style={{
                                                display: 'block',
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: 'var(--font-size-sm)',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'all var(--transition-fast)',
                                                marginBottom: 'var(--spacing-xs)',
                                            }}
                                        >
                                            {circle.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {circles.member.length > 0 && (
                                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-tertiary)',
                                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                    }}>
                                        Member
                                    </div>
                                    {circles.member.slice(0, 5).map((circle) => (
                                        <Link
                                            key={circle.id}
                                            to={`/circles/${circle.id}`}
                                            className={styles.subNavLink}
                                            style={{
                                                display: 'block',
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: 'var(--font-size-sm)',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'all var(--transition-fast)',
                                                marginBottom: 'var(--spacing-xs)',
                                            }}
                                        >
                                            {circle.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {circles.owned.length === 0 && circles.member.length === 0 && (
                                <div style={{
                                    padding: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-tertiary)'
                                }}>
                                    No circles
                                </div>
                            )}
                            <Link
                                to="/circles"
                                style={{
                                    display: 'block',
                                    padding: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-primary)',
                                    marginTop: 'var(--spacing-sm)',
                                }}
                            >
                                + View All
                            </Link>
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
