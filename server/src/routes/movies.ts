import { Hono } from 'hono';
import { TMDBService } from '../services/tmdb.service.js';
import { MovieRepository } from '../repositories/movie.repository.js';

const movies = new Hono();
const tmdbService = new TMDBService();
const movieRepository = new MovieRepository();

// Search movies with caching
movies.get('/search', async (c) => {
    const query = c.req.query('q');

    if (!query) {
        return c.json({ error: 'Query parameter required' }, 400);
    }

    try {
        // Get cached results immediately
        const cachedMovies = await movieRepository.searchInCache(query);

        // Fetch fresh results from TMDB in background
        tmdbService.searchMovies(query).then(async (freshMovies) => {
            if (freshMovies.length > 0) {
                await movieRepository.cacheMovies(freshMovies);
            }
        });

        // Return cached results (or empty array if nothing cached)
        return c.json({
            movies: cachedMovies,
            source: cachedMovies.length > 0 ? 'cache' : 'fetching',
        });
    } catch (error) {
        console.error('Search error:', error);
        return c.json({ error: 'Search failed' }, 500);
    }
});

// Get movie details
movies.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
        return c.json({ error: 'Invalid movie ID' }, 400);
    }

    try {
        // Check cache first
        let movie = await movieRepository.getByTmdbId(id);

        // If not in cache, fetch from TMDB
        if (!movie) {
            const tmdbMovie = await tmdbService.getMovieDetails(id);
            if (tmdbMovie) {
                movie = await movieRepository.cacheMovie(tmdbMovie);
            }
        }

        if (!movie) {
            return c.json({ error: 'Movie not found' }, 404);
        }

        return c.json({ movie });
    } catch (error) {
        console.error('Movie details error:', error);
        return c.json({ error: 'Failed to fetch movie' }, 500);
    }
});

export default movies;
