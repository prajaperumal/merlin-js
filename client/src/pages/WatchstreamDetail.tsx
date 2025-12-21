import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Movie, StreamingPlatform } from '../types';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/SearchBar';
import { StreamingPlatformBadge } from '../components/StreamingPlatformBadge';
import styles from './WatchstreamDetail.module.css';

export function WatchstreamDetail() {
    const { id } = useParams<{ id: string }>();
    const [backlogMovies, setBacklogMovies] = useState<Movie[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'backlog' | 'watched'>('backlog');
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadMovies();
        }
    }, [id]);

    const loadMovies = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [backlog, watched] = await Promise.all([
                api.getWatchstreamMovies(parseInt(id), 'backlog'),
                api.getWatchstreamMovies(parseInt(id), 'watched'),
            ]);
            setBacklogMovies(backlog);
            setWatchedMovies(watched);
        } catch (error) {
            console.error('Failed to load movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMovie = async (movie: Movie, streamingPlatforms?: StreamingPlatform[]) => {
        if (!id) return;
        try {
            await api.addMovieToWatchstream(parseInt(id), movie.tmdbId, activeTab, streamingPlatforms);
            setShowAddMovieModal(false);
            loadMovies();
        } catch (error: any) {
            console.error('Failed to add movie:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    const handleMarkAsWatched = async (movieTmdbId: number) => {
        if (!id) return;
        try {
            const movie = backlogMovies.find(m => m.tmdbId === movieTmdbId);
            await api.updateMovieStatus(parseInt(id), movieTmdbId, 'watched', movie?.streamingPlatforms);
            // Move from backlog to watched
            if (movie) {
                setBacklogMovies(prev => prev.filter(m => m.tmdbId !== movieTmdbId));
                setWatchedMovies(prev => [movie, ...prev]);
            }
        } catch (error) {
            console.error('Failed to update movie status:', error);
        }
    };

    const handleMarkAsBacklog = async (movieTmdbId: number) => {
        if (!id) return;
        try {
            const movie = watchedMovies.find(m => m.tmdbId === movieTmdbId);
            await api.updateMovieStatus(parseInt(id), movieTmdbId, 'backlog', movie?.streamingPlatforms);
            // Move from watched to backlog
            if (movie) {
                setWatchedMovies(prev => prev.filter(m => m.tmdbId !== movieTmdbId));
                setBacklogMovies(prev => [movie, ...prev]);
            }
        } catch (error) {
            console.error('Failed to update movie status:', error);
        }
    };

    const currentMovies = activeTab === 'backlog' ? backlogMovies : watchedMovies;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading watchstream...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Watchstream</h1>
                    <div className={styles.stats}>
                        <span className={styles.statItem}>{backlogMovies.length} to watch</span>
                        <span className={styles.statDivider}>·</span>
                        <span className={styles.statItem}>{watchedMovies.length} watched</span>
                    </div>
                </div>
                <Button onClick={() => setShowAddMovieModal(true)}>
                    <Icon name="plus" size="small" />
                    Add Movie
                </Button>
                <div className={styles.tabs}>
                    <button
                        className={activeTab === 'backlog' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('backlog')}
                    >
                        <Icon name="bookmark" size="small" />
                        Backlog ({backlogMovies.length})
                    </button>
                    <button
                        className={activeTab === 'watched' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('watched')}
                    >
                        <Icon name="check-circle" size="small" />
                        Watched ({watchedMovies.length})
                    </button>
                </div>
            </div>

            {currentMovies.length > 0 ? (
                <div className={styles.grid}>
                    {currentMovies.map((movie) => (
                        <Card key={movie.tmdbId} className={styles.movieCard}>
                            <div className={styles.posterContainer}>
                                {movie.posterUrl ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className={styles.poster}
                                    />
                                ) : (
                                    <div className={styles.posterPlaceholder}>
                                        <Icon name="film" size="large" />
                                    </div>
                                )}
                                <div className={styles.overlay}>
                                    {activeTab === 'backlog' ? (
                                        <Button
                                            size="small"
                                            onClick={() => handleMarkAsWatched(movie.tmdbId)}
                                            className={styles.statusButton}
                                        >
                                            <Icon name="check-circle" size="small" />
                                            Mark Watched
                                        </Button>
                                    ) : (
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() => handleMarkAsBacklog(movie.tmdbId)}
                                            className={styles.statusButton}
                                        >
                                            <Icon name="bookmark" size="small" />
                                            Rewatch
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.movieInfo}>
                                <h3 className={styles.movieTitle}>{movie.title}</h3>
                                {movie.year && <p className={styles.year}>{movie.year}</p>}
                                <div className={styles.movieMeta}>
                                    {movie.voteAverage && (
                                        <div className={styles.rating}>
                                            <Icon name="star" size="small" />
                                            <span>{movie.voteAverage.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && (
                                        <StreamingPlatformBadge platforms={movie.streamingPlatforms} size="small" />
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>
                        {activeTab === 'backlog' ? '📚' : '✅'}
                    </div>
                    <h3 className={styles.emptyTitle}>
                        {activeTab === 'backlog' ? 'No movies in backlog' : 'No watched movies'}
                    </h3>
                    <p className={styles.emptyText}>
                        {activeTab === 'backlog'
                            ? 'Add movies to your watchstream to get started'
                            : 'Mark movies as watched to see them here'}
                    </p>
                </div>
            )}

            <Modal
                isOpen={showAddMovieModal}
                onClose={() => setShowAddMovieModal(false)}
                title="Add Movie to Watchstream"
            >
                <SearchBar
                    onAddToWatchstream={handleAddMovie}
                    showPlatformSelection={true}
                />
            </Modal>
        </div>
    );
}
