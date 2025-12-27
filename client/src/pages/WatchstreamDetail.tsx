import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Movie, StreamingPlatform } from '../types';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/SearchBar';
import { StreamingPlatformBadge } from '../components/StreamingPlatformBadge';
import { RecommendToCirclesModal } from '../components/RecommendToCirclesModal';
import { DiscussionDrawer } from '../components/DiscussionDrawer';
import { RefreshButton } from '../components/RefreshButton';
import { useRefresh, usePolling } from '../hooks';
import styles from './WatchstreamDetail.module.css';

export function WatchstreamDetail() {
    const { id } = useParams<{ id: string }>();
    const [backlogMovies, setBacklogMovies] = useState<Movie[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'backlog' | 'watched'>('backlog');
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [showCirclesModal, setShowCirclesModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showDiscussionDrawer, setShowDiscussionDrawer] = useState(false);
    const [discussionMovie, setDiscussionMovie] = useState<any | null>(null);

    const loadMovies = useCallback(async () => {
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
    }, [id]);

    // Manual refresh
    const { refresh, isRefreshing } = useRefresh(loadMovies);

    // Optional polling (60 seconds)
    usePolling(loadMovies, { interval: 60000, enabled: true });

    useEffect(() => {
        if (id) {
            loadMovies();
        }
    }, [id, loadMovies]);

    // Optimistic add movie
    const handleAddMovie = async (movie: Movie, streamingPlatforms?: StreamingPlatform[]) => {
        if (!id) return;

        const movieWithPlatforms = { ...movie, streamingPlatforms, watchStatus: activeTab };
        const previousBacklog = [...backlogMovies];
        const previousWatched = [...watchedMovies];

        try {
            // Optimistically add to UI
            if (activeTab === 'backlog') {
                setBacklogMovies(prev => [movieWithPlatforms, ...prev]);
            } else {
                setWatchedMovies(prev => [movieWithPlatforms, ...prev]);
            }
            setShowAddMovieModal(false);

            // Make API call
            await api.addMovieToWatchstream(parseInt(id), movie.dataProviderId, activeTab, streamingPlatforms);
        } catch (error: any) {
            // Rollback on error
            setBacklogMovies(previousBacklog);
            setWatchedMovies(previousWatched);
            console.error('Failed to add movie:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    // Optimistic mark as watched
    const handleMarkAsWatched = async (movieId: number) => {
        if (!id) return;

        const movie = backlogMovies.find(m => m.dataProviderId === movieId);
        if (!movie) return;

        const previousBacklog = [...backlogMovies];
        const previousWatched = [...watchedMovies];

        try {
            // Optimistically move from backlog to watched
            setBacklogMovies(prev => prev.filter(m => m.dataProviderId !== movieId));
            setWatchedMovies(prev => [{ ...movie, watchStatus: 'watched' }, ...prev]);

            // Make API call
            await api.updateMovieStatus(parseInt(id), movieId, 'watched', movie.streamingPlatforms);
        } catch (error) {
            // Rollback on error
            setBacklogMovies(previousBacklog);
            setWatchedMovies(previousWatched);
            console.error('Failed to update movie status:', error);
        }
    };

    const handleRecommendToCircles = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowCirclesModal(true);
    };

    const handleCirclesSuccess = () => {
        setShowCirclesModal(false);
        setSelectedMovie(null);
    };

    const handleOpenDiscussion = (item: any) => {
        setDiscussionMovie(item);
        setShowDiscussionDrawer(true);
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
                    <RefreshButton onRefresh={refresh} loading={isRefreshing} />
                </div>
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
                        <Card
                            key={movie.dataProviderId}
                            className={`${styles.movieCard} ${styles.clickableCard}`}
                            onClick={() => handleOpenDiscussion(movie)}
                        >
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
                                <div className={styles.cardActions}>
                                    {activeTab === 'backlog' && (
                                        <button
                                            className={styles.cardActionButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsWatched(movie.dataProviderId);
                                            }}
                                            title="Mark Watched"
                                        >
                                            <Icon name="check-circle" size="medium" />
                                        </button>
                                    )}
                                    <button
                                        className={styles.cardActionButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRecommendToCircles(movie);
                                        }}
                                        title="Recommend to Circles"
                                    >
                                        <Icon name="users" size="medium" />
                                    </button>
                                    <button
                                        className={styles.cardActionButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDiscussion(movie);
                                        }}
                                        title="Discuss Movie"
                                    >
                                        <Icon name="message-square" size="medium" />
                                    </button>
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

            {/* Floating Action Button */}
            <button
                className={styles.fab}
                onClick={() => setShowAddMovieModal(true)}
                title="Add Movie"
            >
                <Icon name="plus" size="large" />
            </button>

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

            {selectedMovie && (
                <RecommendToCirclesModal
                    isOpen={showCirclesModal}
                    onClose={() => setShowCirclesModal(false)}
                    movie={selectedMovie}
                    onSuccess={handleCirclesSuccess}
                />
            )}

            {discussionMovie && (
                <DiscussionDrawer
                    isOpen={showDiscussionDrawer}
                    onClose={() => setShowDiscussionDrawer(false)}
                    movie={discussionMovie}
                    circleMovieId={discussionMovie.circleMovieId}
                />
            )}
        </div>
    );
}
