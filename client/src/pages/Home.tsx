import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Movie, Watchstream } from '../types';
import { SearchBar } from '../components/SearchBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import styles from './Home.module.css';

export function Home() {
    const { user, login } = useAuth();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstream, setSelectedWatchstream] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'backlog' | 'watched'>('backlog');
    const [showCreateWatchstream, setShowCreateWatchstream] = useState(false);
    const [newWatchstreamName, setNewWatchstreamName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const loadWatchstreams = async () => {
        try {
            const data = await api.getWatchstreams();
            setWatchstreams(data);
        } catch (err) {
            console.error('Failed to load watchstreams:', err);
        }
    };

    const handleAddToWatchstream = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowAddModal(true);
        setSelectedWatchstream(null);
        setSelectedStatus('backlog');
        setError('');
        loadWatchstreams();
    };

    const handleCreateWatchstream = async () => {
        if (!newWatchstreamName.trim()) return;

        try {
            const newWatchstream = await api.createWatchstream(newWatchstreamName);
            setWatchstreams([...watchstreams, newWatchstream]);
            setSelectedWatchstream(newWatchstream.id);
            setNewWatchstreamName('');
            setShowCreateWatchstream(false);
        } catch (err: any) {
            setError(err.message || 'Failed to create watchstream');
        }
    };

    const handleAddMovie = async () => {
        if (!selectedMovie || !selectedWatchstream) return;

        setIsAdding(true);
        setError('');

        try {
            await api.addMovieToWatchstream(selectedWatchstream, selectedMovie.tmdbId, selectedStatus);
            setShowAddModal(false);
            setSelectedMovie(null);
            setSelectedWatchstream(null);
        } catch (err: any) {
            setError(err.message || 'Failed to add movie');
        } finally {
            setIsAdding(false);
        }
    };

    if (!user) {
        return (
            <div className={styles.home}>
                <div className={styles.loginPrompt}>
                    <h1 className={styles.title}>Welcome to Merlin</h1>
                    <p className={styles.subtitle}>Discover and track your favorite movies</p>
                    <Button onClick={login} className={styles.loginButton}>
                        Sign in with Google
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Discover Movies</h1>
                <p className={styles.subtitle}>Search and add movies to your watchstreams</p>
            </div>

            <div className={styles.searchSection}>
                <SearchBar onAddToWatchstream={handleAddToWatchstream} />
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Add "${selectedMovie?.title}" to Watchstream`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMovie}
                            disabled={!selectedWatchstream || isAdding}
                        >
                            {isAdding ? 'Adding...' : 'Add Movie'}
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {/* Watchstream Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            Select Watchstream
                        </label>
                        {watchstreams.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {watchstreams.map((ws) => (
                                    <div
                                        key={ws.id}
                                        onClick={() => setSelectedWatchstream(ws.id)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            border: `2px solid ${selectedWatchstream === ws.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            backgroundColor: selectedWatchstream === ws.id ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                                        }}
                                    >
                                        {ws.name}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                No watchstreams yet. Create one below.
                            </p>
                        )}

                        {!showCreateWatchstream && (
                            <Button
                                variant="ghost"
                                size="small"
                                onClick={() => setShowCreateWatchstream(true)}
                                style={{ marginTop: 'var(--spacing-sm)', width: '100%' }}
                            >
                                + Create New Watchstream
                            </Button>
                        )}

                        {showCreateWatchstream && (
                            <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <Input
                                    placeholder="Watchstream name"
                                    value={newWatchstreamName}
                                    onChange={(e) => setNewWatchstreamName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchstream()}
                                />
                                <Button size="small" onClick={handleCreateWatchstream}>
                                    Create
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="small"
                                    onClick={() => {
                                        setShowCreateWatchstream(false);
                                        setNewWatchstreamName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
                            Watch Status
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            {(['backlog', 'watched'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--spacing-sm)',
                                        border: `2px solid ${selectedStatus === status ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        backgroundColor: selectedStatus === status ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-bg-tertiary)',
                                        color: selectedStatus === status ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                        textTransform: 'capitalize',
                                        fontWeight: 500,
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                            {error}
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
}

