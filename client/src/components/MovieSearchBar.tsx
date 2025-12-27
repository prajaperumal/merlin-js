import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';
import { Icon } from './ui/Icon';
import { AddToWatchstreamModal } from './AddToWatchstreamModal';
import { RecommendToCirclesModal } from './RecommendToCirclesModal';
import styles from './MovieSearchBar.module.css';

export function MovieSearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Movie[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [showWatchstreamModal, setShowWatchstreamModal] = useState(false);
    const [showCirclesModal, setShowCirclesModal] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

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
                setShowSuggestions(true);
                setLoading(false);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setLoading(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddToWatchstream = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowWatchstreamModal(true);
        setShowSuggestions(false);
    };

    const handleRecommendToCircles = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowCirclesModal(true);
        setShowSuggestions(false);
    };

    const handleWatchstreamSuccess = () => {
        setShowWatchstreamModal(false);
        setSelectedMovie(null);
        setQuery('');
        setSuggestions([]);
    };

    const handleCirclesSuccess = () => {
        setShowCirclesModal(false);
        setSelectedMovie(null);
        setQuery('');
        setSuggestions([]);
    };

    return (
        <>
            <div className={styles.searchContainer} ref={searchRef}>
                <div className={styles.searchBar}>
                    <Icon name="search" size="medium" className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search for movies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                        className={styles.searchInput}
                    />
                    {loading && <div className={styles.spinner} />}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div className={styles.dropdown}>
                        {suggestions.map((movie) => (
                            <div key={movie.dataProviderId} className={styles.movieResult}>
                                <div className={styles.movieContent}>
                                    {movie.posterUrl ? (
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            className={styles.poster}
                                        />
                                    ) : (
                                        <div className={styles.posterPlaceholder}>
                                            <Icon name="film" size="medium" />
                                        </div>
                                    )}
                                    <div className={styles.movieInfo}>
                                        <div className={styles.movieTitle}>{movie.title}</div>
                                        <div className={styles.movieMeta}>
                                            {movie.year && <span>{movie.year}</span>}
                                            {movie.voteAverage && (
                                                <span className={styles.rating}>
                                                    <Icon name="star" size="small" />
                                                    {movie.voteAverage.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        {movie.overview && (
                                            <div className={styles.overview}>{movie.overview}</div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.recommendButton}
                                        onClick={() => handleRecommendToCircles(movie)}
                                        title="Recommend to Circles"
                                    >
                                        <Icon name="share" size="small" />
                                        <span>Recommend</span>
                                    </button>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleAddToWatchstream(movie)}
                                        title="Add to Watchstream"
                                    >
                                        <Icon name="bookmark" size="medium" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showSuggestions && !loading && query.length >= 2 && suggestions.length === 0 && (
                    <div className={styles.dropdown}>
                        <div className={styles.noResults}>No movies found</div>
                    </div>
                )}
            </div>

            {selectedMovie && (
                <>
                    <AddToWatchstreamModal
                        isOpen={showWatchstreamModal}
                        onClose={() => setShowWatchstreamModal(false)}
                        movie={selectedMovie}
                        onSuccess={handleWatchstreamSuccess}
                    />
                    <RecommendToCirclesModal
                        isOpen={showCirclesModal}
                        onClose={() => setShowCirclesModal(false)}
                        movie={selectedMovie}
                        onSuccess={handleCirclesSuccess}
                    />
                </>
            )}
        </>
    );
}
