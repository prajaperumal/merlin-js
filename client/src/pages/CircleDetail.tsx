import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Circle, CircleMember, Movie, Watchstream } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SearchBar } from '../components/SearchBar';
import { DiscussionDrawer } from '../components/DiscussionDrawer';
import { useAuth } from '../contexts/AuthContext';
import styles from './CircleDetail.module.css';

export function CircleDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [circle, setCircle] = useState<Circle | null>(null);
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [showAddToWatchstreamModal, setShowAddToWatchstreamModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [recommendation, setRecommendation] = useState('');
    const [userWatchstreams, setUserWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstream, setSelectedWatchstream] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'backlog' | 'watched'>('backlog');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [showDiscussionDrawer, setShowDiscussionDrawer] = useState(false);
    const [discussionMovie, setDiscussionMovie] = useState<any | null>(null);

    useEffect(() => {
        if (id) {
            loadCircleDetails();
            loadCircleMovies();
        }
    }, [id]);

    const loadCircleDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getCircleDetails(parseInt(id));
            setCircle(data.circle);
            setMembers(data.circle.members || []);
        } catch (error) {
            console.error('Failed to load circle details:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCircleMovies = async () => {
        if (!id) return;
        try {
            const data = await api.getCircleMovies(parseInt(id));
            setMovies(data);
        } catch (error) {
            console.error('Failed to load circle movies:', error);
        }
    };

    const loadUserWatchstreams = async () => {
        try {
            const data = await api.getWatchstreams();
            setUserWatchstreams(data);
        } catch (error) {
            console.error('Failed to load watchstreams:', error);
        }
    };

    const handleInvite = async () => {
        if (!id || !inviteEmail) return;
        setInviting(true);
        setError('');
        try {
            await api.inviteMember(parseInt(id), inviteEmail);
            setShowInviteModal(false);
            setInviteEmail('');
            loadCircleDetails();
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    const handleSelectMovieForCircle = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowAddMovieModal(false);
    };

    const handleAddMovieToCircle = async () => {
        if (!id || !selectedMovie) return;
        try {
            await api.addMovieToCircle(parseInt(id), selectedMovie.tmdbId, recommendation);
            setSelectedMovie(null);
            setRecommendation('');
            loadCircleMovies();
        } catch (error: any) {
            console.error('Failed to add movie to circle:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    const handleOpenAddToWatchstream = async (movie: Movie) => {
        setSelectedMovie(movie);
        await loadUserWatchstreams();
        setShowAddToWatchstreamModal(true);
    };

    const handleOpenDiscussion = (item: any) => {
        setDiscussionMovie(item);
        setShowDiscussionDrawer(true);
    };

    const handleAddToPersonalWatchstream = async () => {
        if (!selectedMovie || !selectedWatchstream) return;
        try {
            await api.addMovieToWatchstream(selectedWatchstream, selectedMovie.tmdbId, selectedStatus);
            setShowAddToWatchstreamModal(false);
            setSelectedMovie(null);
            setSelectedWatchstream(null);
            setSelectedStatus('backlog');
        } catch (error: any) {
            console.error('Failed to add to watchstream:', error);
            alert(error.message || 'Failed to add movie');
        }
    };

    const isOwner = circle && user && circle.ownerUserId === user.id;
    const isMember = circle && user && members.some(m => m.id === user.id);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading circle...</div>
            </div>
        );
    }

    if (!circle) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Circle not found</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainLayout}>
                <div className={styles.mainContent}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>{circle.name}</h1>
                            {circle.description && (
                                <p className={styles.description}>{circle.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Circle Watchstream Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Watchstream</h2>
                            <span className={styles.movieCount}>{movies.length} movies</span>
                        </div>
                        {movies.length > 0 ? (
                            <div className={styles.moviesList}>
                                {movies.map((item) => (
                                    <Card
                                        key={item.movie.tmdbId}
                                        className={`${styles.movieTile} ${styles.clickableTile}`}
                                        onClick={() => handleOpenDiscussion(item)}
                                    >
                                        <div className={styles.movieTileContent}>
                                            {item.movie.posterUrl && (
                                                <img
                                                    src={item.movie.posterUrl}
                                                    alt={item.movie.title}
                                                    className={styles.movieTilePoster}
                                                />
                                            )}
                                            <div className={styles.movieTileDetails}>
                                                <h3 className={styles.movieTileTitle}>{item.movie.title}</h3>
                                                <p className={styles.movieTileYear}>{item.movie.year}</p>

                                                {item.recommendation && (
                                                    <div className={styles.recommendationSection}>
                                                        <div className={styles.recommendationHeader}>
                                                            {item.user.picture ? (
                                                                <img
                                                                    src={item.user.picture}
                                                                    alt={item.user.name || item.user.email}
                                                                    className={styles.recommendationAvatar}
                                                                />
                                                            ) : (
                                                                <div className={styles.recommendationAvatarPlaceholder}>
                                                                    {(item.user.name || item.user.email).charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <span className={styles.recommendationAuthor}>
                                                                {item.user.name || item.user.email}
                                                            </span>
                                                        </div>
                                                        <p className={styles.recommendationText}>"{item.recommendation}"</p>
                                                    </div>
                                                )}

                                                {!item.recommendation && item.movie.overview && (
                                                    <p className={styles.movieTileOverview}>{item.movie.overview}</p>
                                                )}
                                            </div>
                                            <div className={styles.movieTileActions}>
                                                <div className={styles.topActions}>
                                                    {!item.recommendation && (
                                                        <div className={styles.addedBySection}>
                                                            {item.user.picture ? (
                                                                <img
                                                                    src={item.user.picture}
                                                                    alt={item.user.name || item.user.email}
                                                                    className={styles.addedByAvatar}
                                                                />
                                                            ) : (
                                                                <div className={styles.addedByAvatarPlaceholder}>
                                                                    {(item.user.name || item.user.email).charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className={styles.addedByInfo}>
                                                                <p className={styles.addedByLabel}>Added by</p>
                                                                <p className={styles.addedByName}>{item.user.name || item.user.email}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleOpenDiscussion(item)}
                                                        className={styles.discussionButton}
                                                    >
                                                        <Icon name="message-square" className={styles.buttonIcon} />
                                                        Discussion
                                                    </Button>
                                                </div>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenAddToWatchstream(item.movie);
                                                    }}
                                                    className={styles.addToWatchstreamButton}
                                                >
                                                    Add to My Watchstream
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                <p>No movies in circle watchstream yet</p>
                                {isMember && <p>Be the first to add a movie!</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Members Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3 className={styles.sidebarTitle}>Members</h3>
                        <span className={styles.memberCount}>{members.length}</span>
                    </div>
                    <div className={styles.membersGrid}>
                        {members.map((member) => (
                            <div key={member.id} className={styles.memberIcon} title={member.name || member.email}>
                                {member.picture ? (
                                    <img
                                        src={member.picture}
                                        alt={member.name || member.email}
                                        className={styles.memberAvatar}
                                    />
                                ) : (
                                    <div className={styles.memberAvatarPlaceholder}>
                                        {(member.name || member.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {member.isOwner && <div className={styles.ownerIndicator} title="Owner">★</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            {(isMember || isOwner) && (
                <div className={styles.fabContainer}>
                    {showFabMenu && (
                        <div className={styles.fabMenu}>
                            {isMember && (
                                <button
                                    className={styles.fabMenuItem}
                                    onClick={() => {
                                        setShowAddMovieModal(true);
                                        setShowFabMenu(false);
                                    }}
                                >
                                    <span className={styles.fabMenuIcon}>🎬</span>
                                    <span className={styles.fabMenuLabel}>Add Movie</span>
                                </button>
                            )}
                            {isOwner && (
                                <button
                                    className={styles.fabMenuItem}
                                    onClick={() => {
                                        setShowInviteModal(true);
                                        setShowFabMenu(false);
                                    }}
                                >
                                    <span className={styles.fabMenuIcon}>👤</span>
                                    <span className={styles.fabMenuLabel}>Invite Member</span>
                                </button>
                            )}
                        </div>
                    )}
                    <button
                        className={`${styles.fab} ${showFabMenu ? styles.fabActive : ''}`}
                        onClick={() => setShowFabMenu(!showFabMenu)}
                        aria-label="Actions"
                    >
                        <span className={styles.fabIcon}>{showFabMenu ? '×' : '+'}</span>
                    </button>
                </div>
            )}

            {/* Invite Member Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setError('');
                }}
                title="Invite Member"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowInviteModal(false);
                                setInviteEmail('');
                                setError('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
                            {inviting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                    />
                    {error && (
                        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                            {error}
                        </p>
                    )}
                </div>
            </Modal>

            {/* Search Movie Modal */}
            <Modal
                isOpen={showAddMovieModal}
                onClose={() => setShowAddMovieModal(false)}
                title="Search Movie"
            >
                <SearchBar onAddToWatchstream={handleSelectMovieForCircle} />
            </Modal>

            {/* Add Recommendation Modal */}
            <Modal
                isOpen={!!selectedMovie && !showAddToWatchstreamModal}
                onClose={() => {
                    setSelectedMovie(null);
                    setRecommendation('');
                }}
                title="Add Recommendation"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSelectedMovie(null);
                                setRecommendation('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddMovieToCircle}>
                            Add to Circle
                        </Button>
                    </>
                }
            >
                {selectedMovie && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                            {selectedMovie.posterUrl && (
                                <img
                                    src={selectedMovie.posterUrl}
                                    alt={selectedMovie.title}
                                    style={{ width: '80px', height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                />
                            )}
                            <div>
                                <h3 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-lg)' }}>
                                    {selectedMovie.title}
                                </h3>
                                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                    {selectedMovie.year}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                Why do you recommend this movie? (Optional)
                            </label>
                            <textarea
                                value={recommendation}
                                onChange={(e) => setRecommendation(e.target.value)}
                                placeholder="Share why you think this movie is worth watching..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 'var(--font-size-md)',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add to Personal Watchstream Modal */}
            <Modal
                isOpen={showAddToWatchstreamModal}
                onClose={() => {
                    setShowAddToWatchstreamModal(false);
                    setSelectedMovie(null);
                    setSelectedWatchstream(null);
                }}
                title="Add to My Watchstream"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddToWatchstreamModal(false);
                                setSelectedMovie(null);
                                setSelectedWatchstream(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToPersonalWatchstream}
                            disabled={!selectedWatchstream}
                        >
                            Add
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)', display: 'block' }}>
                            Select Watchstream
                        </label>
                        <select
                            value={selectedWatchstream || ''}
                            onChange={(e) => setSelectedWatchstream(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="">Choose a watchstream...</option>
                            {userWatchstreams.map((ws) => (
                                <option key={ws.id} value={ws.id}>
                                    {ws.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)', display: 'block' }}>
                            Status
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <Button
                                variant={selectedStatus === 'backlog' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedStatus('backlog')}
                                size="small"
                            >
                                Backlog
                            </Button>
                            <Button
                                variant={selectedStatus === 'watched' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedStatus('watched')}
                                size="small"
                            >
                                Watched
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {discussionMovie && (
                <DiscussionDrawer
                    isOpen={showDiscussionDrawer}
                    onClose={() => setShowDiscussionDrawer(false)}
                    movie={discussionMovie.movie}
                    circleMovieId={discussionMovie.circleMovieId}
                />
            )}
        </div>
    );
}
