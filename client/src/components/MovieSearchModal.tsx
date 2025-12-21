import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie, Watchstream, Circle, StreamingPlatform } from '../types';
import { Icon } from './ui/Icon';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlatformSelector } from './PlatformSelector';
import styles from './MovieSearchModal.module.css';

interface MovieSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ActionMode = 'select' | 'watchstream' | 'circles';

export function MovieSearchModal({ isOpen, onClose }: MovieSearchModalProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [actionMode, setActionMode] = useState<ActionMode>('select');

    // Watchstream mode state
    const [watchstreams, setWatchstreams] = useState<Watchstream[]>([]);
    const [selectedWatchstream, setSelectedWatchstream] = useState<number | null>(null);
    const [watchStatus, setWatchStatus] = useState<'backlog' | 'watched'>('backlog');
    const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);

    // Circles mode state
    const [circles, setCircles] = useState<Circle[]>([]);
    const [selectedCircles, setSelectedCircles] = useState<Set<number>>(new Set());
    const [recommendation, setRecommendation] = useState('');

    const debounceRef = useRef<NodeJS.Timeout>();

    // Fetch watchstreams and circles when modal opens
    useEffect(() => {
        if (isOpen) {
            loadWatchstreamsAndCircles();
        }
    }, [isOpen]);

    // Search movies
    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(async () => {
                const movies = await api.searchMovies(query);
                setSuggestions(movies.slice(0, 8));
                setLoading(false);
            }, 300);
        } else {
            setSuggestions([]);
            setLoading(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const loadWatchstreamsAndCircles = async () => {
        try {
            const [watchstreamsData, circlesData] = await Promise.all([
                api.getWatchstreams(),
                api.getCircles(),
            ]);
            setWatchstreams(watchstreamsData);
            setCircles([...circlesData.owned, ...circlesData.member]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleMovieSelect = (movie: Movie) => {
        setSelectedMovie(movie);
        setActionMode('select');
    };

    const handleAddToWatchstream = async () => {
        if (!selectedMovie || !selectedWatchstream) return;

        try {
            await api.addMovieToWatchstream(
                selectedWatchstream,
                selectedMovie.tmdbId,
                watchStatus,
                streamingPlatforms.length > 0 ? streamingPlatforms : undefined
            );
            resetAndClose();
        } catch (error) {
            console.error('Error adding to watchstream:', error);
            alert('Failed to add movie to watchstream');
        }
    };

    const handleRecommendToCircles = async () => {
        if (!selectedMovie || selectedCircles.size === 0) return;

        try {
            await Promise.all(
                Array.from(selectedCircles).map(circleId =>
                    api.addMovieToCircle(
                        circleId,
                        selectedMovie.tmdbId,
                        recommendation || undefined
                    )
                )
            );
            resetAndClose();
        } catch (error) {
            console.error('Error recommending to circles:', error);
            alert('Failed to recommend movie to circles');
        }
    };

    const toggleCircleSelection = (circleId: number) => {
        const newSelection = new Set(selectedCircles);
        if (newSelection.has(circleId)) {
            newSelection.delete(circleId);
        } else {
            newSelection.add(circleId);
        }
        setSelectedCircles(newSelection);
    };

    const resetAndClose = () => {
        setQuery('');
        setSuggestions([]);
        setSelectedMovie(null);
        setActionMode('select');
        setSelectedWatchstream(null);
        setWatchStatus('backlog');
        setStreamingPlatforms([]);
        setSelectedCircles(new Set());
        setRecommendation('');
        onClose();
    };

    const renderSearchResults = () => (
        <div className={styles.searchSection}>
            <div className={styles.searchInput}>
                <Icon name="search" size="medium" />
                <Input
                    type="text"
                    placeholder="Search for movies..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {loading && (
                <div className={styles.loading}>Searching...</div>
            )}

            {!loading && suggestions.length > 0 && (
                <div className={styles.results}>
                    {suggestions.map((movie) => (
                        <div
                            key={movie.tmdbId}
                            className={styles.movieCard}
                            onClick={() => handleMovieSelect(movie)}
                        >
                            {movie.posterUrl ? (
                                <img src={movie.posterUrl} alt={movie.title} className={styles.poster} />
                            ) : (
                                <div className={styles.posterPlaceholder}>
                                    <Icon name="film" size="large" />
                                </div>
                            )}
                            <div className={styles.movieInfo}>
                                <div className={styles.movieTitle}>{movie.title}</div>
                                <div className={styles.movieMeta}>
                                    {movie.year && <span>{movie.year}</span>}
                                    {movie.voteAverage && (
                                        <span>
                                            <Icon name="star" size="small" /> {movie.voteAverage.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                {movie.overview && (
                                    <div className={styles.movieOverview}>{movie.overview}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && query.length >= 2 && suggestions.length === 0 && (
                <div className={styles.noResults}>No movies found</div>
            )}
        </div>
    );

    const renderActionSelection = () => (
        <div className={styles.actionSection}>
            <div className={styles.selectedMovie}>
                {selectedMovie?.posterUrl && (
                    <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className={styles.selectedPoster} />
                )}
                <div>
                    <h3>{selectedMovie?.title}</h3>
                    {selectedMovie?.year && <p className={styles.year}>{selectedMovie.year}</p>}
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    onClick={() => setActionMode('watchstream')}
                    className={styles.actionButton}
                >
                    <Icon name="bookmark" size="medium" />
                    <span>Add to Watchstream</span>
                </Button>
                <Button
                    onClick={() => setActionMode('circles')}
                    className={styles.actionButton}
                >
                    <Icon name="users" size="medium" />
                    <span>Recommend to Circles</span>
                </Button>
            </div>

            <Button variant="secondary" onClick={() => setSelectedMovie(null)}>
                <Icon name="chevron-left" size="small" />
                Back to Search
            </Button>
        </div>
    );

    const renderWatchstreamSelection = () => (
        <div className={styles.watchstreamSection}>
            <Button variant="ghost" onClick={() => setActionMode('select')} className={styles.backButton}>
                <Icon name="chevron-left" size="small" />
                Back
            </Button>

            <h3>Add to Watchstream</h3>

            <div className={styles.formGroup}>
                <label>Select Watchstream</label>
                <select
                    value={selectedWatchstream || ''}
                    onChange={(e) => setSelectedWatchstream(parseInt(e.target.value))}
                    className={styles.select}
                >
                    <option value="">Choose a watchstream...</option>
                    {watchstreams.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                            {ws.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Watch Status</label>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value="backlog"
                            checked={watchStatus === 'backlog'}
                            onChange={(e) => setWatchStatus(e.target.value as 'backlog' | 'watched')}
                        />
                        <span>Backlog</span>
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value="watched"
                            checked={watchStatus === 'watched'}
                            onChange={(e) => setWatchStatus(e.target.value as 'backlog' | 'watched')}
                        />
                        <span>Watched</span>
                    </label>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Streaming Platforms (Optional)</label>
                <PlatformSelector
                    selectedPlatforms={streamingPlatforms}
                    onChange={setStreamingPlatforms}
                />
            </div>

            <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setActionMode('select')}>
                    Cancel
                </Button>
                <Button onClick={handleAddToWatchstream} disabled={!selectedWatchstream}>
                    Add Movie
                </Button>
            </div>
        </div>
    );

    const renderCirclesSelection = () => (
        <div className={styles.circlesSection}>
            <Button variant="ghost" onClick={() => setActionMode('select')} className={styles.backButton}>
                <Icon name="chevron-left" size="small" />
                Back
            </Button>

            <h3>Recommend to Circles</h3>

            <div className={styles.formGroup}>
                <label>Select Circles</label>
                <div className={styles.circlesList}>
                    {circles.length === 0 ? (
                        <p className={styles.noCircles}>No circles available</p>
                    ) : (
                        circles.map((circle) => (
                            <label key={circle.id} className={styles.circleOption}>
                                <input
                                    type="checkbox"
                                    checked={selectedCircles.has(circle.id)}
                                    onChange={() => toggleCircleSelection(circle.id)}
                                />
                                <span>{circle.name}</span>
                                {circle.isOwner && <span className={styles.ownerBadge}>Owner</span>}
                            </label>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Recommendation Message (Optional)</label>
                <textarea
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Why are you recommending this movie?"
                    className={styles.textarea}
                    rows={3}
                />
            </div>

            <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setActionMode('select')}>
                    Cancel
                </Button>
                <Button onClick={handleRecommendToCircles} disabled={selectedCircles.size === 0}>
                    Recommend to {selectedCircles.size} {selectedCircles.size === 1 ? 'Circle' : 'Circles'}
                </Button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title="Search Movies"
        >
            <div className={styles.movieSearchModal}>
                {!selectedMovie && renderSearchResults()}
                {selectedMovie && actionMode === 'select' && renderActionSelection()}
                {selectedMovie && actionMode === 'watchstream' && renderWatchstreamSelection()}
                {selectedMovie && actionMode === 'circles' && renderCirclesSelection()}
            </div>
        </Modal>
    );
}
