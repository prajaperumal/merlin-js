import { useState, useEffect } from 'react';
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
                            key={movie.tmdbId}
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
                                                handleMarkAsWatched(movie.tmdbId);
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
