import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie, StreamingPlatform } from '../types';
import { Input } from './ui/Input';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { PlatformSelector } from './PlatformSelector';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onAddToWatchstream?: (movie: Movie, streamingPlatforms?: StreamingPlatform[]) => void;
    showPlatformSelection?: boolean;
}

export function SearchBar({ onAddToWatchstream, showPlatformSelection = false }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Movie[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (query.length >= 2) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(async () => {
                const movies = await api.searchMovies(query);
                setSuggestions(movies.slice(0, 5));
                setShowSuggestions(true);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const handleAddClick = (e: React.MouseEvent, movie: Movie) => {
        e.stopPropagation();
        if (showPlatformSelection) {
            setSelectedMovie(movie);
            setStreamingPlatforms([]);
            setShowPlatformModal(true);
        } else if (onAddToWatchstream) {
            onAddToWatchstream(movie);
        }
    };

    const handleConfirmAdd = () => {
        if (selectedMovie && onAddToWatchstream) {
            onAddToWatchstream(selectedMovie, streamingPlatforms.length > 0 ? streamingPlatforms : undefined);
            setShowPlatformModal(false);
            setSelectedMovie(null);
            setStreamingPlatforms([]);
            setQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    return (
        <div className={styles.searchBar}>
            <div className={styles.inputWrapper}>
                <span className={styles.searchIcon}>
                    <Icon name="search" size="medium" />
                </span>
                <Input
                    type="text"
                    placeholder="Search for movies..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.input}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestions}>
                    {suggestions.map((movie) => (
                        <div
                            key={movie.tmdbId}
                            className={styles.suggestion}
                        >
                            {movie.posterUrl ? (
                                <img src={movie.posterUrl} alt={movie.title} className={styles.suggestionPoster} />
                            ) : (
                                <div className={styles.suggestionPlaceholder}>No Poster</div>
                            )}
                            <div className={styles.suggestionInfo}>
                                <div className={styles.suggestionTitle}>{movie.title}</div>
                                <div className={styles.suggestionMeta}>
                                    {movie.year && <span>{movie.year}</span>}
                                    {movie.voteAverage && (
                                        <span>
                                            • <Icon name="star" size="small" style={{ verticalAlign: 'middle' }} /> {movie.voteAverage.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="small"
                                onClick={(e) => handleAddClick(e, movie)}
                                className={styles.addButton}
                            >
                                <Icon name="bookmark" size="small" />
                                Add
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {showPlatformSelection && (
                <Modal
                    isOpen={showPlatformModal}
                    onClose={() => {
                        setShowPlatformModal(false);
                        setSelectedMovie(null);
                        setStreamingPlatforms([]);
                    }}
                    title="Select Streaming Platforms"
                    footer={
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowPlatformModal(false);
                                    setSelectedMovie(null);
                                    setStreamingPlatforms([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmAdd}>
                                Add Movie
                            </Button>
                        </>
                    }
                >
                    {selectedMovie && (
                        <div>
                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <h3 style={{ margin: 0, marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
                                    {selectedMovie.title}
                                </h3>
                                {selectedMovie.year && (
                                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {selectedMovie.year}
                                    </p>
                                )}
                            </div>
                            <PlatformSelector
                                selectedPlatforms={streamingPlatforms}
                                onChange={setStreamingPlatforms}
                            />
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
