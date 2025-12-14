import { env } from '../config/env.js';
import type { TMDBMovie } from '../types/index.js';

export class TMDBService {
    private baseUrl = env.TMDB_BASE_URL;
    private apiKey = env.TMDB_API_KEY;
    private imageBaseUrl = env.TMDB_IMAGE_BASE_URL;

    /**
     * Search for movies by query
     */
    async searchMovies(query: string): Promise<TMDBMovie[]> {
        try {
            const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`TMDB API error: ${response.statusText}`);
            }

            const data = await response.json();
            return this.transformMovies(data.results || []);
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    /**
     * Get movie details by ID
     */
    async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
        try {
            const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`TMDB API error: ${response.statusText}`);
            }

            const data = await response.json();
            return this.transformMovie(data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    /**
     * Transform TMDB movie data to our format
     */
    private transformMovies(movies: any[]): TMDBMovie[] {
        return movies.map(movie => this.transformMovie(movie));
    }

    private transformMovie(movie: any): TMDBMovie {
        const year = movie.release_date ? movie.release_date.split('-')[0] : undefined;

        return {
            id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
            original_language: movie.original_language,
            adult: movie.adult,
            genre_ids: movie.genre_ids,
        };
    }

    /**
     * Get full poster URL
     */
    getPosterUrl(posterPath: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string | null {
        if (!posterPath) return null;
        return `${this.imageBaseUrl}/${size}${posterPath}`;
    }

    /**
     * Get full backdrop URL
     */
    getBackdropUrl(backdropPath: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
        if (!backdropPath) return null;
        return `${this.imageBaseUrl}/${size}${backdropPath}`;
    }
}
