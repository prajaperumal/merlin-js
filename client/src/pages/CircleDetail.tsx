import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Circle, CircleMember, Movie, Watchstream } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../contexts/AuthContext';
import styles from './CircleDetail.module.css';

export function CircleDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [circle, setCircle] = useState<Circle | null>(null);
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [showAddToWatchstreamModal, setShowAddToWatchstreamModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [userWatchstreams, setUserWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstream, setSelectedWatchstream] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'backlog' | 'watched'>('backlog');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');

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

    const handleRemoveMember = async (userId: number) => {
        if (!id || !window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.removeMember(parseInt(id), userId);
            loadCircleDetails();
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const handleAddMovieToCircle = async (movie: Movie) => {
        if (!id) return;
        try {
            await api.addMovieToCircle(parseInt(id), movie.tmdbId);
            setShowAddMovieModal(false);
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
        <div className={styles.container} data-theme="circle">
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{circle.name}</h1>
                    {circle.description && (
                        <p className={styles.description}>{circle.description}</p>
                    )}
                </div>
                {isOwner && (
                    <Button onClick={() => setShowInviteModal(true)}>
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Collapsible Members Section */}
            <div className={styles.section}>
                <div
                    className={styles.collapsibleHeader}
                    onClick={() => setShowMembers(!showMembers)}
                >
                    <h2 className={styles.sectionTitle}>Members ({members.length})</h2>
                    <span className={styles.chevron}>{showMembers ? '▼' : '▶'}</span>
                </div>
                {showMembers && (
                    <div className={styles.members}>
                        {members.map((member) => (
                            <Card key={member.id} className={styles.member}>
                                <div className={styles.memberInfo}>
                                    {member.picture ? (
                                        <img
                                            src={member.picture}
                                            alt={member.name || member.email}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {(member.name || member.email).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className={styles.memberDetails}>
                                        <div className={styles.memberName}>
                                            {member.name || member.email}
                                            {member.isOwner && (
                                                <span className={styles.ownerBadge}>Owner</span>
                                            )}
                                        </div>
                                        <div className={styles.memberEmail}>{member.email}</div>
                                    </div>
                                </div>
                                {isOwner && !member.isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className={styles.removeButton}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Circle Watchstream Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Circle Watchstream ({movies.length})</h2>
                    {isMember && (
                        <Button onClick={() => setShowAddMovieModal(true)}>
                            Add Movie
                        </Button>
                    )}
                </div>
                {movies.length > 0 ? (
                    <div className={styles.moviesList}>
                        {movies.map((item) => (
                            <Card key={item.movie.tmdbId} className={styles.movieTile}>
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
                                        {item.movie.overview && (
                                            <p className={styles.movieTileOverview}>{item.movie.overview}</p>
                                        )}
                                    </div>
                                    <div className={styles.movieTileActions}>
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
                                        <Button
                                            onClick={() => handleOpenAddToWatchstream(item.movie)}
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

            {/* Add Movie to Circle Modal */}
            <Modal
                isOpen={showAddMovieModal}
                onClose={() => setShowAddMovieModal(false)}
                title="Add Movie to Circle"
            >
                <SearchBar onAddToWatchstream={handleAddMovieToCircle} />
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
        </div>
    );
}
