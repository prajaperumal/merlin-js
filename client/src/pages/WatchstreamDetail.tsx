import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Movie } from '../types';
import { Card } from '../components/ui/Card';
import styles from './WatchstreamDetail.module.css';

export function WatchstreamDetail() {
    const { id } = useParams<{ id: string }>();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'backlog' | 'watched'>('backlog');

    useEffect(() => {
        if (id) {
            loadMovies();
        }
    }, [id, status]);

    const loadMovies = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getWatchstreamMovies(parseInt(id), status);
            setMovies(data);
        } catch (error) {
            console.error('Failed to load movies:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading movies...</div>
            </div>
        );
    }

    return (
        <div className={styles.container} data-theme="watchstream">
            <div className={styles.header}>
                <h1 className={styles.title}>Watchstream Movies</h1>
                <div className={styles.tabs}>
                    <button
                        className={status === 'backlog' ? styles.tabActive : styles.tab}
                        onClick={() => setStatus('backlog')}
                    >
                        Backlog
                    </button>
                    <button
                        className={status === 'watched' ? styles.tabActive : styles.tab}
                        onClick={() => setStatus('watched')}
                    >
                        Watched
                    </button>
                </div>
            </div>

            {movies.length > 0 ? (
                <div className={styles.grid}>
                    {movies.map((movie) => (
                        <Card key={movie.id}>
                            {movie.posterUrl && (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className={styles.poster}
                                />
                            )}
                            <div className={styles.movieInfo}>
                                <h3 className={styles.movieTitle}>{movie.title}</h3>
                                {movie.year && (
                                    <p className={styles.year}>{movie.year}</p>
                                )}
                                {movie.overview && (
                                    <p className={styles.overview}>{movie.overview}</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>No movies in this status yet.</p>
                </div>
            )}
        </div>
    );
}
