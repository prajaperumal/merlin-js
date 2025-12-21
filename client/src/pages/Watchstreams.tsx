import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Watchstream } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Icon } from '../components/ui/Icon';
import styles from './Watchstreams.module.css';

interface WatchstreamWithCounts extends Watchstream {
    backlogCount?: number;
    watchedCount?: number;
}

export function Watchstreams() {
    const [watchstreams, setWatchstreams] = useState<WatchstreamWithCounts[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadWatchstreams();
    }, []);

    const loadWatchstreams = async () => {
        const data = await api.getWatchstreams();
        // Load counts for each watchstream
        const watchstreamsWithCounts = await Promise.all(
            data.map(async (ws) => {
                try {
                    const [backlog, watched] = await Promise.all([
                        api.getWatchstreamMovies(ws.id, 'backlog'),
                        api.getWatchstreamMovies(ws.id, 'watched'),
                    ]);
                    return {
                        ...ws,
                        backlogCount: backlog.length,
                        watchedCount: watched.length,
                    };
                } catch {
                    return { ...ws, backlogCount: 0, watchedCount: 0 };
                }
            })
        );
        setWatchstreams(watchstreamsWithCounts);
    };

    const handleCreate = async () => {
        try {
            setError('');
            await api.createWatchstream(newName);
            setNewName('');
            setShowCreateModal(false);
            loadWatchstreams();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Watchstreams</h1>
                    <p className={styles.subtitle}>{watchstreams.length} {watchstreams.length === 1 ? 'watchstream' : 'watchstreams'}</p>
                </div>
                {watchstreams.length > 0 && (
                    <Button onClick={() => setShowCreateModal(true)}>Create Watchstream</Button>
                )}
            </div>

            {watchstreams.length > 0 ? (
                <div className={styles.grid}>
                    {watchstreams.map((watchstream) => (
                        <Link
                            key={watchstream.id}
                            to={`/watchstreams/${watchstream.id}`}
                            className={styles.watchstreamCard}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}>
                                    <Icon name="airplay" size="large" />
                                </div>
                                <h3 className={styles.cardTitle}>{watchstream.name}</h3>
                            </div>
                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <Icon name="bookmark" size="small" />
                                    <span className={styles.statValue}>{watchstream.backlogCount || 0}</span>
                                    <span className={styles.statLabel}>to watch</span>
                                </div>
                                <div className={styles.statDivider}>·</div>
                                <div className={styles.stat}>
                                    <Icon name="check-circle" size="small" />
                                    <span className={styles.statValue}>{watchstream.watchedCount || 0}</span>
                                    <span className={styles.statLabel}>watched</span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={styles.cardDate}>
                                    Created {new Date(watchstream.createdAt).toLocaleDateString()}
                                </span>
                                <Icon name="chevron-right" size="small" className={styles.cardArrow} />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📺</div>
                    <h3 className={styles.emptyTitle}>No watchstreams yet</h3>
                    <p className={styles.emptyText}>
                        Create your first watchstream to start tracking movies
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create Watchstream
                    </Button>
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewName('');
                }}
                title="Create Watchstream"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!newName}>
                            Create
                        </Button>
                    </>
                }
            >
                <div>
                    <Input
                        placeholder="Watchstream name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        error={!!error}
                    />
                    {error && <p style={{ color: 'var(--color-error)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
                </div>
            </Modal>
        </div>
    );
}
