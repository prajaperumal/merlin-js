import { Movie } from '../types';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    movie: Movie;
    onAddToWatchstream?: () => void;
}

export function MovieCard({ movie, onAddToWatchstream }: MovieCardProps) {
    return (
        <div className={styles.movieCard}>
            {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className={styles.poster} />
            ) : (
                <div className={styles.placeholder}>No Poster</div>
            )}
            <div className={styles.overlay}>
                <h3 className={styles.title}>{movie.title}</h3>
                <div className={styles.meta}>
                    {movie.year && <span>{movie.year}</span>}
                    {movie.voteAverage && (
                        <div className={styles.rating}>
                            <Icon name="star" size="small" />
                            <span>{movie.voteAverage.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                {onAddToWatchstream && (
                    <div className={styles.actions}>
                        <Button size="small" onClick={onAddToWatchstream}>
                            <Icon name="bookmark" size="small" />
                            Add to Watchstream
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
