import { useState, useEffect } from 'react';
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
import { DiscussionDrawer } from '../components/DiscussionDrawer';
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
}

interface HomeProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    onCountsChange: (discoverCount: number, watchstreamsCount: number) => void;
}

export function Home({ mode, onModeChange: _onModeChange, onCountsChange }: HomeProps) {
    const { user, login } = useAuth();

    // Discover mode state
    const [circleMovies, setCircleMovies] = useState<CircleMovie[]>([]);
    const [circles, setCircles] = useState<CircleWithMembers[]>([]);
    const [selectedCircleFilter, setSelectedCircleFilter] = useState<number | null>(null);

    // Watchstream mode state
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstreamId, setSelectedWatchstreamId] = useState<number | null>(null);
    const [backlogMovies, setBacklogMovies] = useState<Movie[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string | null>(null);

    // Modals
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
    const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<{ id: number; name: string } | null>(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showWatchstreamModal, setShowWatchstreamModal] = useState(false);
    const [showCirclesModal, setShowCirclesModal] = useState(false);
    const [showDiscussionDrawer, setShowDiscussionDrawer] = useState(false);
    const [discussionMovie, setDiscussionMovie] = useState<any | null>(null);

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
            const allCircles = [...circlesData.owned, ...circlesData.member];

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
                    members: circleDetails.members
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
            await api.addMovieToWatchstream(selectedWatchstreamId, movie.tmdbId, 'backlog', streamingPlatforms);
            setShowAddMovieModal(false);
            loadWatchstreamMovies();
        } catch (error: any) {
            console.error('Failed to add movie:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    const handleMarkAsWatched = async (movieTmdbId: number) => {
        if (!selectedWatchstreamId) return;
        try {
            const movie = backlogMovies.find(m => m.tmdbId === movieTmdbId);
            await api.updateMovieStatus(selectedWatchstreamId, movieTmdbId, 'watched', movie?.streamingPlatforms);
            setBacklogMovies(prev => prev.filter(m => m.tmdbId !== movieTmdbId));
            if (movie) {
                setWatchedMovies(prev => [movie, ...prev]);
            }
        } catch (error) {
            console.error('Failed to update movie status:', error);
        }
    };

    const handleAddMember = async () => {
        if (!selectedCircleFilter || !newMemberEmail.trim()) return;
        try {
            await api.inviteMember(selectedCircleFilter, newMemberEmail.trim());
            setShowAddMemberModal(false);
            setNewMemberEmail('');
            alert('Invitation sent successfully!');
            // Reload circle data to get updated members
            loadCircleMovies();
        } catch (error: any) {
            console.error('Failed to invite member:', error);
            alert(error.message || 'Failed to invite member');
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedCircleFilter || !selectedMemberToRemove) return;
        try {
            await api.removeMember(selectedCircleFilter, selectedMemberToRemove.id);
            setShowRemoveMemberModal(false);
            setSelectedMemberToRemove(null);
            // Reload circle data to get updated members
            loadCircleMovies();
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            alert(error.message || 'Failed to invite member');
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

    const handleCirclesSuccess = () => {
        setShowCirclesModal(false);
        setSelectedMovie(null);
    };

    const handleOpenDiscussion = (item: any) => {
        setDiscussionMovie(item);
        setShowDiscussionDrawer(true);
    };


    const filteredCircleMovies = selectedCircleFilter
        ? circleMovies.filter(m => m.circleId === selectedCircleFilter)
        : circleMovies;

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

    if (!user) {
        return (
            <div className={styles.home}>
                <div className={styles.loginPrompt}>
                    <h1 className={styles.title}>Welcome to Merlin</h1>
                    <p className={styles.subtitle}>Discover and track movies with friends</p>
                    <Button onClick={login} className={styles.loginButton}>
                        Sign in with Google
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.home}>
            {/* Discover Mode */}
            {mode === 'discover' && (
                <div className={styles.discoverLayout}>
                    <div className={styles.mainContent}>

                        {/* Circle Filters */}
                        {circles.length > 0 && (
                            <div className={styles.filters}>
                                <button
                                    className={selectedCircleFilter === null ? styles.filterActive : styles.filter}
                                    onClick={() => setSelectedCircleFilter(null)}
                                >
                                    All Circles
                                </button>
                                {circles.map(circle => (
                                    <button
                                        key={circle.id}
                                        className={selectedCircleFilter === circle.id ? styles.filterActive : styles.filter}
                                        onClick={() => setSelectedCircleFilter(circle.id)}
                                    >
                                        {circle.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Movies Grid */}
                        {filteredCircleMovies.length > 0 ? (
                            <div className={styles.grid}>
                                {filteredCircleMovies.map((movie) => (
                                    <Card
                                        key={`${movie.circleId}-${movie.tmdbId}`}
                                        className={`${styles.movieCard} ${styles.clickableCard}`}
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
                                            <div className={styles.circleTag}>{movie.circleName}</div>
                                            <div className={styles.cardActions}>
                                                <button
                                                    className={styles.cardActionButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToWatchstream(movie);
                                                    }}
                                                    title="Add to Watchstream"
                                                >
                                                    <Icon name="bookmark" size="medium" />
                                                </button>
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
                                            {movie.recommender && (
                                                <div className={styles.recommenderAvatar} title={`Recommended by ${movie.recommender.name || 'User'}`}>
                                                    {movie.recommender.picture ? (
                                                        <img src={movie.recommender.picture} alt={movie.recommender.name || ''} className={styles.avatarImg} />
                                                    ) : (
                                                        <div className={styles.avatarPlaceholder}>
                                                            {(movie.recommender.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {movie.recommendation && (
                                                <p className={styles.recommendation}>"{movie.recommendation}"</p>
                                            )}
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
                                <div className={styles.emptyIcon}>🎬</div>
                                <h3 className={styles.emptyTitle}>No movies yet</h3>
                                <p className={styles.emptyText}>
                                    Join or create circles to see movie recommendations
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Members Panel */}
                    {selectedCircleFilter && circles.find(c => c.id === selectedCircleFilter)?.members && (() => {
                        const selectedCircle = circles.find(c => c.id === selectedCircleFilter);
                        const isOwner = selectedCircle?.members?.some(m => m.id === user?.id && m.isOwner);
                        return (
                            <div className={styles.membersPanel}>
                                <div className={styles.membersPanelHeader}>
                                    <Icon name="users-group" size="small" />
                                    <span>Members</span>
                                </div>

                                <div className={styles.memberAvatars}>
                                    {selectedCircle?.members?.map(member => {
                                        const firstName = member.name?.split(' ')[0] || 'User';
                                        const canRemove = isOwner && !member.isOwner && member.id !== user?.id;
                                        return (
                                            <div key={member.id} className={styles.memberItem}>
                                                <div className={styles.memberAvatarContainer}>
                                                    {member.picture ? (
                                                        <img
                                                            src={member.picture}
                                                            alt={member.name || ''}
                                                            className={styles.memberAvatar}
                                                        />
                                                    ) : (
                                                        <div className={styles.memberAvatarPlaceholder}>
                                                            {(member.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {member.isOwner && (
                                                        <div className={styles.ownerIndicator}>
                                                            <Icon name="crown" size="small" />
                                                        </div>
                                                    )}
                                                    {canRemove && (
                                                        <button
                                                            className={styles.removeMemberButton}
                                                            onClick={() => {
                                                                setSelectedMemberToRemove({ id: member.id, name: member.name || 'User' });
                                                                setShowRemoveMemberModal(true);
                                                            }}
                                                            title="Remove member"
                                                        >
                                                            <Icon name="minus" size="small" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={styles.memberName}>{firstName}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {isOwner && (
                                    <button
                                        className={styles.addMemberButton}
                                        onClick={() => setShowAddMemberModal(true)}
                                        title="Invite member"
                                    >
                                        <Icon name="plus" size="medium" />
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* My Watchstream Mode */}
            {mode === 'watchstream' && (
                <div className={styles.content}>
                    {/* Watchstream Selector */}
                    {watchstreams.length > 0 && (
                        <div className={styles.watchstreamNavigation}>
                            <div className={styles.watchstreamFilters}>
                                {watchstreams.map(watchstream => (
                                    <button
                                        key={watchstream.id}
                                        className={selectedWatchstreamId === watchstream.id ? styles.filterActive : styles.filter}
                                        onClick={() => setSelectedWatchstreamId(watchstream.id)}
                                    >
                                        {watchstream.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State - No Watchstreams */}
                    {watchstreams.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📺</div>
                            <h3 className={styles.emptyTitle}>No watchstreams yet</h3>
                            <p className={styles.emptyText}>
                                Create a watchstream from the Watchstreams page to get started
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
                                        const isWatched = watchedMovies.some(m => m.tmdbId === movie.tmdbId);
                                        return (
                                            <Card
                                                key={movie.tmdbId}
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

            {/* Add Member Modal */}
            <Modal
                isOpen={showAddMemberModal}
                onClose={() => {
                    setShowAddMemberModal(false);
                    setNewMemberEmail('');
                }}
                title="Invite Member to Circle"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                        Enter the email address of the person you want to invite to this circle.
                    </p>
                    <input
                        type="email"
                        placeholder="Email address"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                        style={{
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-md)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                        }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowAddMemberModal(false);
                                setNewMemberEmail('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddMember}
                            disabled={!newMemberEmail.trim()}
                        >
                            Send Invitation
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Remove Member Modal */}
            <Modal
                isOpen={showRemoveMemberModal}
                onClose={() => {
                    setShowRemoveMemberModal(false);
                    setSelectedMemberToRemove(null);
                }}
                title="Remove Member"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                        Are you sure you want to remove <strong>{selectedMemberToRemove?.name}</strong> from this circle?
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowRemoveMemberModal(false);
                                setSelectedMemberToRemove(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleRemoveMember}
                        >
                            Remove Member
                        </Button>
                    </div>
                </div>
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
                        .filter(m => m.tmdbId === selectedMovie.tmdbId)
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
        </div>
    );
}
