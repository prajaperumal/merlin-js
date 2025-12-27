import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Movie, StreamingPlatform, Circle, Watchstream, CircleMember } from '../types';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { SearchBar } from '../components/SearchBar';
import { StreamingPlatformBadge } from '../components/StreamingPlatformBadge';
import { AddToWatchstreamModal } from '../components/AddToWatchstreamModal';
import { RecommendToCirclesModal } from '../components/RecommendToCirclesModal';
import { CreateCircleModal } from '../components/CreateCircleModal';
import { DiscussionDrawer } from '../components/DiscussionDrawer';
import { Input } from '../components/ui/Input';
import { Login } from './Login';
import styles from './Home.module.css';

type AppMode = 'discover' | 'watchstream';

interface CircleMovie extends Movie {
    circleName?: string;
    circleId?: number;
    recommender?: {
        name: string | null;
        picture: string | null;
    };
    recommendation?: string;
}

interface CircleWithMembers extends Circle {
    members?: CircleMember[];
    movieCount?: number;
}

interface HomeProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    onCountsChange: (discoverCount: number, watchstreamsCount: number) => void;
}

export function Home({ mode, onModeChange: _onModeChange, onCountsChange }: HomeProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Discover mode state
    const [circleMovies, setCircleMovies] = useState<CircleMovie[]>([]);
    const [circles, setCircles] = useState<CircleWithMembers[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);

    // Watchstream mode state
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstreamId, setSelectedWatchstreamId] = useState<number | null>(null);
    const [backlogMovies, setBacklogMovies] = useState<Movie[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string | null>(null);

    // Modals
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showWatchstreamModal, setShowWatchstreamModal] = useState(false);
    const [showCirclesModal, setShowCirclesModal] = useState(false);
    const [showDiscussionDrawer, setShowDiscussionDrawer] = useState(false);
    const [discussionMovie, setDiscussionMovie] = useState<any | null>(null);
    const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
    const [showCreateWatchstreamModal, setShowCreateWatchstreamModal] = useState(false);
    const [newWatchstreamName, setNewWatchstreamName] = useState('');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, mode]);

    useEffect(() => {
        if (selectedWatchstreamId && mode === 'watchstream') {
            loadWatchstreamMovies();
        }
    }, [selectedWatchstreamId]);

    useEffect(() => {
        // Update counts in header
        onCountsChange(circleMovies.length, watchstreams.length);
    }, [circleMovies.length, watchstreams.length, onCountsChange]);

    const loadData = async () => {
        try {
            if (mode === 'discover') {
                await loadCircleMovies();
            } else {
                await loadWatchstreams();
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const loadCircleMovies = async () => {
        try {
            const circlesData = await api.getCircles();
            setPendingInvitations(circlesData.pendingInvitations || []);

            // Mark circles as owned or member
            const ownedCircles = circlesData.owned.map((c: Circle) => ({ ...c, isOwner: true }));
            const memberCircles = circlesData.member.map((c: Circle) => ({ ...c, isOwner: false }));
            const allCircles = [...ownedCircles, ...memberCircles];

            // Load movies and member details from all circles
            const allMovies: CircleMovie[] = [];
            const circlesWithMembers: CircleWithMembers[] = [];

            for (const circle of allCircles) {
                // Load movies
                const movies = await api.getCircleMovies(circle.id);
                const moviesWithCircle = movies.map((m: any) => ({
                    ...m,
                    circleName: circle.name,
                    circleId: circle.id,
                    recommender: m.addedBy,
                }));
                allMovies.push(...moviesWithCircle);

                // Load member details
                const { circle: circleDetails } = await api.getCircleDetails(circle.id);
                circlesWithMembers.push({
                    ...circle,
                    members: circleDetails.members,
                    movieCount: movies.length
                });
            }

            setCircles(circlesWithMembers);
            setCircleMovies(allMovies);
        } catch (error) {
            console.error('Failed to load circle movies:', error);
        }
    };

    const loadWatchstreams = async () => {
        try {
            const watchstreamList = await api.getWatchstreams();
            setWatchstreams(watchstreamList);

            // Auto-select first watchstream if none selected
            if (watchstreamList.length > 0 && !selectedWatchstreamId) {
                setSelectedWatchstreamId(watchstreamList[0].id);
            }
        } catch (error) {
            console.error('Failed to load watchstreams:', error);
        }
    };

    const loadWatchstreamMovies = async () => {
        if (!selectedWatchstreamId) return;

        try {
            const [backlog, watched] = await Promise.all([
                api.getWatchstreamMovies(selectedWatchstreamId, 'backlog'),
                api.getWatchstreamMovies(selectedWatchstreamId, 'watched'),
            ]);
            setBacklogMovies(backlog);
            setWatchedMovies(watched);
        } catch (error) {
            console.error('Failed to load watchstream movies:', error);
        }
    };

    const handleAddMovieToWatchstream = async (movie: Movie, streamingPlatforms?: StreamingPlatform[]) => {
        if (!selectedWatchstreamId) return;
        try {
            await api.addMovieToWatchstream(selectedWatchstreamId, movie.dataProviderId, 'backlog', streamingPlatforms);
            setShowAddMovieModal(false);
            loadWatchstreamMovies();
        } catch (error: any) {
            console.error('Failed to add movie:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    const handleMarkAsWatched = async (movieId: number) => {
        if (!selectedWatchstreamId) return;
        try {
            const movie = backlogMovies.find(m => m.dataProviderId === movieId);
            await api.updateMovieStatus(selectedWatchstreamId, movieId, 'watched', movie?.streamingPlatforms);
            setBacklogMovies(prev => prev.filter(m => m.dataProviderId !== movieId));
            if (movie) {
                setWatchedMovies(prev => [movie, ...prev]);
            }
        } catch (error) {
            console.error('Failed to update movie status:', error);
        }
    };

    const handleAddToWatchstream = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowWatchstreamModal(true);
    };

    const handleWatchstreamSuccess = () => {
        setShowWatchstreamModal(false);
        setSelectedMovie(null);
    };

    const handleRecommendToCircles = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowCirclesModal(true);
    };

    const handleCreateCircle = async (name: string, description: string, invitedEmails: string[]) => {
        if (!name.trim()) return;
        try {
            // TODO: Update API to support invitedEmails when backend is ready
            await api.createCircle(name.trim(), description.trim());
            setShowCreateCircleModal(false);
            loadCircleMovies();
        } catch (error: any) {
            console.error('Failed to create circle:', error);
            alert(error.message || 'Failed to create circle');
        }
    };

    const handleCreateWatchstream = async () => {
        if (!newWatchstreamName.trim()) return;
        try {
            await api.createWatchstream(newWatchstreamName.trim());
            setShowCreateWatchstreamModal(false);
            setNewWatchstreamName('');
            loadWatchstreams();
        } catch (error: any) {
            console.error('Failed to create watchstream:', error);
            alert(error.message || 'Failed to create watchstream');
        }
    };

    const handleAcceptInvitation = async (circleId: number) => {
        try {
            await api.acceptInvitation(circleId);
            loadData();
        } catch (error) {
            console.error('Failed to accept invitation:', error);
        }
    };

    const handleDeclineInvitation = async (circleId: number) => {
        try {
            await api.declineInvitation(circleId);
            loadData();
        } catch (error) {
            console.error('Failed to decline invitation:', error);
        }
    };

    const handleCirclesSuccess = () => {
        setShowCirclesModal(false);
        setSelectedMovie(null);
    };

    const handleOpenDiscussion = (item: any) => {
        setDiscussionMovie(item);
        setShowDiscussionDrawer(true);
    };

    // Combine backlog and watched movies for unified view
    const allWatchstreamMovies = [...backlogMovies, ...watchedMovies];

    const filteredWatchstreamMovies = platformFilter
        ? allWatchstreamMovies.filter(
            m => m.streamingPlatforms?.some(p => p.name === platformFilter)
        )
        : allWatchstreamMovies;

    const allPlatforms = Array.from(
        new Set(
            allWatchstreamMovies.flatMap(m => m.streamingPlatforms?.map(p => p.name) || [])
        )
    );

    // Get recent recommendations (last 10 movies)
    const recentRecommendations = circleMovies.slice(0, 10);

    // Get trending movies (movies with highest ratings)
    const trendingMovies = [...circleMovies]
        .sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
        .slice(0, 5);

    // Calculate stats
    const totalMoviesShared = circleMovies.length;
    const totalInWatchstreams = allWatchstreamMovies.length;

    if (!user) {
        return <Login />;
    }

    return (
        <div className={styles.home}>
            {/* Discover Mode - New Dashboard Design */}
            {mode === 'discover' && (
                <div className={styles.dashboard}>
                    <div className={styles.dashboardContent}>
                        {/* Pending Invitations Banner */}
                        {pendingInvitations.length > 0 && (
                            <div className={styles.invitationsBanner}>
                                {pendingInvitations.map(inv => (
                                    <div key={inv.circle.id} className={styles.invitationCard}>
                                        <div className={styles.invitationContent}>
                                            <div className={styles.invitationIcon}>🎬</div>
                                            <div className={styles.invitationText}>
                                                <strong>{inv.circle.name}</strong> invited you to join!
                                            </div>
                                        </div>
                                        <div className={styles.invitationActions}>
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => handleDeclineInvitation(inv.circle.id)}
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => handleAcceptInvitation(inv.circle.id)}
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Your Circles Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h2 className={styles.sectionTitle}>Your Circles</h2>
                                    <p className={styles.sectionSubtitle}>Movie communities you're part of</p>
                                </div>
                                <div className={styles.sectionHeaderActions}>
                                    {circles.length > 3 && (
                                        <button className={styles.viewAllLink} onClick={() => navigate('/circles')}>
                                            View all
                                            <Icon name="chevron-right" size="small" />
                                        </button>
                                    )}
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => setShowCreateCircleModal(true)}
                                    >
                                        <Icon name="plus" size="small" />
                                        New Circle
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.circleCardsGrid}>
                                {circles
                                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                    .slice(0, 3)
                                    .map((circle, index) => {
                                        const iconColors = [
                                            { bg: '#a855f7', icon: '#ffffff' }, // Purple
                                            { bg: '#f97316', icon: '#ffffff' }, // Orange
                                            { bg: '#3b82f6', icon: '#ffffff' }, // Blue
                                        ];
                                        const colors = iconColors[index % 3];
                                        return (
                                            <div
                                                key={circle.id}
                                                className={styles.circleCard}
                                                onClick={() => navigate(`/circles/${circle.id}`)}
                                            >
                                                <div
                                                    className={styles.circleIcon}
                                                    style={{ backgroundColor: colors.bg }}
                                                >
                                                    <Icon name="film" size="medium" style={{ color: colors.icon }} />
                                                </div>
                                                <div className={styles.circleCardContent}>
                                                    <div className={styles.circleCardHeader}>
                                                        <div className={styles.circleCardTitleRow}>
                                                            <h3 className={styles.circleCardTitle}>{circle.name}</h3>
                                                            <span className={styles.circleCardCount}>
                                                                {circle.memberCount || circle.members?.length || 0} members
                                                            </span>
                                                        </div>
                                                        <span className={circle.isOwner ? styles.ownerBadge : styles.memberBadge}>
                                                            {circle.isOwner ? 'Owner' : 'Member'}
                                                        </span>
                                                    </div>
                                                    {circle.description && (
                                                        <p className={styles.circleCardDescription}>{circle.description}</p>
                                                    )}
                                                    <div className={styles.circleCardFooter}>
                                                        <div className={styles.circleCardMembers}>
                                                            {circle.members?.slice(0, 3).map((member) => (
                                                                <div key={member.id} className={styles.circleMemberAvatar}>
                                                                    {member.picture ? (
                                                                        <img src={member.picture} alt={member.name || ''} />
                                                                    ) : (
                                                                        <div className={styles.circleMemberAvatarPlaceholder}>
                                                                            {(member.name || 'U').charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {circle.members && circle.members.length > 3 && (
                                                                <div className={styles.circleMemberMore}>
                                                                    +{circle.members.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={styles.circleMovieCount}>
                                                            {circle.movieCount || 0} movies
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>

                        {/* Recent Recommendations Section */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h2 className={styles.sectionTitle}>Recent Recommendations</h2>
                                    <p className={styles.sectionSubtitle}>Latest movies shared by your circles</p>
                                </div>
                                {circleMovies.length > 10 && (
                                    <button className={styles.viewAllLink}>
                                        View all
                                        <Icon name="chevron-right" size="small" />
                                    </button>
                                )}
                            </div>
                            {recentRecommendations.length > 0 ? (
                                <div className={styles.recommendationsGrid}>
                                    {recentRecommendations.slice(0, 6).map((movie) => (
                                        <div
                                            key={`${movie.circleId}-${movie.dataProviderId}`}
                                            className={styles.recommendationCard}
                                            onClick={() => handleOpenDiscussion(movie)}
                                        >
                                            <div className={styles.recommendationPoster}>
                                                {movie.posterUrl ? (
                                                    <img src={movie.posterUrl} alt={movie.title} />
                                                ) : (
                                                    <div className={styles.posterPlaceholder}>
                                                        <Icon name="film" size="large" />
                                                    </div>
                                                )}
                                                {movie.voteAverage && (
                                                    <div className={styles.recommendationRating}>
                                                        <Icon name="star" size="small" />
                                                        <span>{movie.voteAverage.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.recommendationInfo}>
                                                <h3 className={styles.recommendationTitle}>{movie.title}</h3>
                                                <p className={styles.recommendationCircle}>{movie.circleName}</p>
                                                {movie.recommender && (
                                                    <p className={styles.recommendationRecommender}>
                                                        by {movie.recommender.name || 'Unknown'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No recommendations yet. Create or join circles to see movies!</p>
                                </div>
                            )}
                        </section>

                        {/* Statistics Cards */}
                        <section className={styles.section}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className={styles.statIcon}>
                                            <Icon name="users" size="medium" />
                                        </div>
                                        <div className={styles.statNumber}>{circles.length}</div>
                                    </div>
                                    <div className={styles.statLabel}>Active Circles</div>
                                    <div className={styles.statSubtext}>Movie communities you're in</div>
                                </div>
                                <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className={styles.statIcon}>
                                            <Icon name="film" size="medium" />
                                        </div>
                                        <div className={styles.statNumber}>{totalMoviesShared}</div>
                                    </div>
                                    <div className={styles.statLabel}>Movies Shared</div>
                                    <div className={styles.statSubtext}>Total recommendations received</div>
                                </div>
                                <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className={styles.statIcon}>
                                            <Icon name="list" size="medium" />
                                        </div>
                                        <div className={styles.statNumber}>{totalInWatchstreams}</div>
                                    </div>
                                    <div className={styles.statLabel}>In Watchstreams</div>
                                    <div className={styles.statSubtext}>Movies on your list</div>
                                </div>
                            </div>
                        </section>

                        {/* Trending in Your Network */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Trending in Your Network</h2>
                                <p className={styles.sectionSubtitle}>Popular movies among your circles</p>
                            </div>
                            {trendingMovies.length > 0 ? (
                                <div className={styles.trendingGrid}>
                                    {trendingMovies.slice(0, 4).map((movie) => (
                                        <div
                                            key={`trending-${movie.circleId}-${movie.dataProviderId}`}
                                            className={styles.trendingCard}
                                        >
                                            <div className={styles.trendingPoster}>
                                                {movie.posterUrl ? (
                                                    <img src={movie.posterUrl} alt={movie.title} />
                                                ) : (
                                                    <div className={styles.posterPlaceholder}>
                                                        <Icon name="film" size="medium" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.trendingContent}>
                                                <div className={styles.trendingHeader}>
                                                    <h3 className={styles.trendingTitle}>{movie.title}</h3>
                                                    {movie.voteAverage && (
                                                        <div className={styles.trendingRatingBadge}>
                                                            <Icon name="star" size="small" />
                                                            {movie.voteAverage.toFixed(1)}
                                                        </div>
                                                    )}
                                                </div>
                                                {movie.overview && (
                                                    <p className={styles.trendingDescription}>
                                                        {movie.overview}
                                                    </p>
                                                )}
                                                <div className={styles.trendingRecommenders}>
                                                    <span className={styles.recommendedByLabel}>Recommended by:</span>
                                                    <div className={styles.recommenderAvatars}>
                                                        {movie.recommender && (
                                                            <div className={styles.recommenderAvatar}>
                                                                {movie.recommender.name?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.trendingButtonRow}>
                                                    <Button
                                                        variant="primary"
                                                        size="medium"
                                                        className={styles.addToWatchstreamBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToWatchstream(movie);
                                                        }}
                                                    >
                                                        <Icon name="plus" size="small" />
                                                        Add to Watchstream
                                                    </Button>
                                                    <button
                                                        className={styles.shareButton}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRecommendToCircles(movie);
                                                        }}
                                                        title="Share to other circles"
                                                    >
                                                        <Icon name="share" size="small" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No trending movies yet.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            {/* My Watchstream Mode */}
            {mode === 'watchstream' && (
                <div className={styles.content}>
                    {/* Watchstream Selector */}
                    <div className={styles.watchstreamNavigation}>
                        <div className={styles.watchstreamFilters}>
                            {watchstreams.length > 0 && (
                                <>
                                    {watchstreams.map(watchstream => (
                                        <button
                                            key={watchstream.id}
                                            className={selectedWatchstreamId === watchstream.id ? styles.filterActive : styles.filter}
                                            onClick={() => setSelectedWatchstreamId(watchstream.id)}
                                        >
                                            {watchstream.name}
                                        </button>
                                    ))}
                                </>
                            )}
                            <button
                                className={styles.createCircleButton}
                                onClick={() => setShowCreateWatchstreamModal(true)}
                                title="Create new watchstream"
                            >
                                <Icon name="plus" size="small" />
                                {watchstreams.length === 0 && <span>Create Your First Watchstream</span>}
                            </button>
                        </div>
                    </div>

                    {/* Empty State - No Watchstreams */}
                    {watchstreams.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📺</div>
                            <h3 className={styles.emptyTitle}>No watchstreams yet</h3>
                            <p className={styles.emptyText}>
                                Create your first watchstream to start tracking movies
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Platform Filters */}
                            {allPlatforms.length > 0 && (
                                <div className={styles.platformFiltersRow}>
                                    <button
                                        className={platformFilter === null ? styles.platformFilterActive : styles.platformFilter}
                                        onClick={() => setPlatformFilter(null)}
                                    >
                                        All
                                    </button>
                                    {allPlatforms.map(platform => (
                                        <button
                                            key={platform}
                                            className={platformFilter === platform ? styles.platformFilterActive : styles.platformFilter}
                                            onClick={() => setPlatformFilter(platform)}
                                        >
                                            {platform}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Combined Movies Grid */}
                            {filteredWatchstreamMovies.length > 0 ? (
                                <div className={styles.grid}>
                                    {filteredWatchstreamMovies.map((movie) => {
                                        const isWatched = watchedMovies.some(m => m.dataProviderId === movie.dataProviderId);
                                        return (
                                            <Card
                                                key={movie.dataProviderId}
                                                className={`${styles.movieCard} ${styles.clickableCard} ${isWatched ? styles.watchedCard : ''}`}
                                                onClick={() => handleOpenDiscussion(movie)}
                                            >
                                                <div className={styles.posterContainer}>
                                                    {movie.posterUrl ? (
                                                        <img src={movie.posterUrl} alt={movie.title} className={styles.poster} />
                                                    ) : (
                                                        <div className={styles.posterPlaceholder}>
                                                            <Icon name="film" size="large" />
                                                        </div>
                                                    )}
                                                    {isWatched && (
                                                        <div className={styles.watchedBadge}>
                                                            <Icon name="check-circle" size="medium" />
                                                        </div>
                                                    )}
                                                    <div className={styles.cardActions}>
                                                        {!isWatched && (
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
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.empty}>
                                    <div className={styles.emptyIcon}>📚</div>
                                    <h3 className={styles.emptyTitle}>No movies yet</h3>
                                    <p className={styles.emptyText}>
                                        Add movies to start building your watchlist
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Floating Action Button */}
                    <button
                        className={styles.fab}
                        onClick={() => setShowAddMovieModal(true)}
                        title="Add Movie"
                    >
                        <Icon name="plus" size="large" />
                    </button>
                </div>
            )}

            {/* Add Movie Modal */}
            <Modal
                isOpen={showAddMovieModal}
                onClose={() => setShowAddMovieModal(false)}
                title="Add Movie to Watchstream"
            >
                <SearchBar
                    onAddToWatchstream={handleAddMovieToWatchstream}
                    showPlatformSelection={true}
                />
            </Modal>

            {/* Add to Watchstream Modal */}
            {selectedMovie && (
                <AddToWatchstreamModal
                    isOpen={showWatchstreamModal}
                    onClose={() => setShowWatchstreamModal(false)}
                    movie={selectedMovie}
                    onSuccess={handleWatchstreamSuccess}
                />
            )}

            {/* Recommend to Circles Modal */}
            {selectedMovie && (
                <RecommendToCirclesModal
                    isOpen={showCirclesModal}
                    onClose={() => setShowCirclesModal(false)}
                    movie={selectedMovie}
                    onSuccess={handleCirclesSuccess}
                    existingCircleIds={circleMovies
                        .filter(m => m.dataProviderId === selectedMovie.dataProviderId)
                        .map(m => m.circleId)
                        .filter((id): id is number => id !== undefined)
                    }
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

            {/* Create Circle Modal */}
            <CreateCircleModal
                isOpen={showCreateCircleModal}
                onClose={() => setShowCreateCircleModal(false)}
                onCreate={handleCreateCircle}
            />

            {/* Create Watchstream Modal */}
            <Modal
                isOpen={showCreateWatchstreamModal}
                onClose={() => {
                    setShowCreateWatchstreamModal(false);
                    setNewWatchstreamName('');
                }}
                title="Create Watchstream"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCreateWatchstreamModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateWatchstream} disabled={!newWatchstreamName.trim()}>
                            Create
                        </Button>
                    </>
                }
            >
                <Input
                    placeholder="Watchstream name"
                    value={newWatchstreamName}
                    onChange={(e) => setNewWatchstreamName(e.target.value)}
                />
            </Modal>
        </div>
    );
}
