import { prisma } from '../config/database.js';
import type { TMDBMovie } from '../types/index.js';
import { TMDBService } from '../services/tmdb.service.js';

export class MovieRepository {
    private tmdbService: TMDBService;

    constructor() {
        this.tmdbService = new TMDBService();
    }

    /**
     * Cache a movie in the database
     */
    async cacheMovie(tmdbMovie: TMDBMovie) {
        const year = tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : null;

        return prisma.movie.upsert({
            where: { tmdbId: tmdbMovie.id },
            update: {
                title: tmdbMovie.title,
                originalTitle: tmdbMovie.original_title,
                overview: tmdbMovie.overview,
                releaseDate: tmdbMovie.release_date,
                year,
                posterPath: tmdbMovie.poster_path,
                posterUrl: this.tmdbService.getPosterUrl(tmdbMovie.poster_path),
                backdropPath: tmdbMovie.backdrop_path,
                backdropUrl: this.tmdbService.getBackdropUrl(tmdbMovie.backdrop_path),
                voteAverage: tmdbMovie.vote_average,
                voteCount: tmdbMovie.vote_count,
                popularity: tmdbMovie.popularity,
                originalLanguage: tmdbMovie.original_language,
                adult: tmdbMovie.adult || false,
                genreIds: tmdbMovie.genre_ids,
            },
            create: {
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title,
                originalTitle: tmdbMovie.original_title,
                overview: tmdbMovie.overview,
                releaseDate: tmdbMovie.release_date,
                year,
                posterPath: tmdbMovie.poster_path,
                posterUrl: this.tmdbService.getPosterUrl(tmdbMovie.poster_path),
                backdropPath: tmdbMovie.backdrop_path,
                backdropUrl: this.tmdbService.getBackdropUrl(tmdbMovie.backdrop_path),
                voteAverage: tmdbMovie.vote_average,
                voteCount: tmdbMovie.vote_count,
                popularity: tmdbMovie.popularity,
                originalLanguage: tmdbMovie.original_language,
                adult: tmdbMovie.adult || false,
                genreIds: tmdbMovie.genre_ids,
            },
        });
    }

    /**
     * Cache multiple movies
     */
    async cacheMovies(tmdbMovies: TMDBMovie[]) {
        const promises = tmdbMovies.map(movie => this.cacheMovie(movie));
        return Promise.all(promises);
    }

    /**
     * Search movies in cache
     */
    async searchInCache(query: string) {
        return prisma.movie.findMany({
            where: {
                title: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                popularity: 'desc',
            },
            take: 20,
        });
    }

    /**
     * Get movie by TMDB ID
     */
    async getByTmdbId(tmdbId: number) {
        return prisma.movie.findUnique({
            where: { tmdbId },
        });
    }
}
