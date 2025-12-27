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
        // Don't cache adult content
        if (tmdbMovie.adult) {
            throw new Error('Adult content is not allowed');
        }

        const year = tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : null;

        return prisma.movie.upsert({
            where: { dataProviderId: tmdbMovie.id },
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
                genreIds: tmdbMovie.genre_ids,
            },
            create: {
                dataProviderId: tmdbMovie.id,
                dataProvider: 'tmdb',
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
                genreIds: tmdbMovie.genre_ids,
            },
        });
    }

    /**
     * Cache multiple movies
     */
    async cacheMovies(tmdbMovies: TMDBMovie[]) {
        // Filter out adult content before caching
        const safeMovies = tmdbMovies.filter(movie => !movie.adult);
        const promises = safeMovies.map(movie => this.cacheMovie(movie));
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
     * Get movie by data provider ID
     */
    async getByDataProviderId(dataProviderId: number, dataProvider: string = 'tmdb') {
        return prisma.movie.findFirst({
            where: {
                dataProviderId,
                dataProvider
            },
        });
    }
}
