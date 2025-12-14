import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';
import { Input } from './ui/Input';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onAddToWatchstream?: (movie: Movie) => void;
}

export function SearchBar({ onAddToWatchstream }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Movie[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
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
        if (onAddToWatchstream) {
            onAddToWatchstream(movie);
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
        </div>
    );
}
