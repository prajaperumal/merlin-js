import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { WatchstreamRepository } from '../repositories/watchstream.repository.js';
import { MovieRepository } from '../repositories/movie.repository.js';
import { TMDBService } from '../services/tmdb.service.js';
import type { AuthSession } from '../types/index.js';

const watchstreams = new Hono();
const watchstreamRepo = new WatchstreamRepository();
const movieRepo = new MovieRepository();
const tmdbService = new TMDBService();

// All routes require authentication
watchstreams.use('/*', authMiddleware);

// Get user's watchstreams
watchstreams.get('/', async (c) => {
    const session = c.get('user') as AuthSession;
    const userWatchstreams = await watchstreamRepo.getUserWatchstreams(session.userId);
    return c.json({ watchstreams: userWatchstreams });
});

// Create watchstream
watchstreams.post('/', async (c) => {
    const session = c.get('user') as AuthSession;
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Name is required' }, 400);
    }

    const watchstream = await watchstreamRepo.create(session.userId, name);

    if (!watchstream) {
        return c.json({ error: 'Watchstream with this name already exists' }, 409);
    }

    return c.json({ watchstream }, 201);
});

// Get watchstream details
watchstreams.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const watchstream = await watchstreamRepo.getById(id);

    if (!watchstream) {
        return c.json({ error: 'Watchstream not found' }, 404);
    }

    return c.json({ watchstream });
});

// Rename watchstream
watchstreams.put('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Name is required' }, 400);
    }

    const watchstream = await watchstreamRepo.rename(id, name);

    if (!watchstream) {
        return c.json({ error: 'Watchstream with this name already exists' }, 409);
    }

    return c.json({ watchstream });
});

// Delete watchstream
watchstreams.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    await watchstreamRepo.delete(id);
    return c.json({ success: true });
});

// Get movies by status
watchstreams.get('/:id/movies', async (c) => {
    const id = parseInt(c.req.param('id'));
    const status = c.req.query('status') || 'backlog';

    const movies = await watchstreamRepo.getMoviesByStatus(id, status);
    return c.json({ movies });
});

// Add movie to watchstream
watchstreams.post('/:id/movies', async (c) => {
    const id = parseInt(c.req.param('id'));
    const { movieTmdbId, watchStatus = 'backlog' } = await c.req.json();

    if (!movieTmdbId) {
        return c.json({ error: 'Movie ID is required' }, 400);
    }

    // Ensure movie is cached
    let movie = await movieRepo.getByTmdbId(movieTmdbId);
    if (!movie) {
        const tmdbMovie = await tmdbService.getMovieDetails(movieTmdbId);
        if (tmdbMovie) {
            movie = await movieRepo.cacheMovie(tmdbMovie);
        }
    }

    const result = await watchstreamRepo.addMovie(id, movieTmdbId, watchStatus);

    if (!result) {
        return c.json({ error: 'Movie already in watchstream' }, 409);
    }

    return c.json({ success: true }, 201);
});

// Remove movie from watchstream
watchstreams.delete('/:id/movies/:movieId', async (c) => {
    const id = parseInt(c.req.param('id'));
    const movieId = parseInt(c.req.param('movieId'));

    await watchstreamRepo.removeMovie(id, movieId);
    return c.json({ success: true });
});

// Update movie status
watchstreams.put('/:id/movies/:movieId', async (c) => {
    const id = parseInt(c.req.param('id'));
    const movieId = parseInt(c.req.param('movieId'));
    const { watchStatus } = await c.req.json();

    if (!watchStatus) {
        return c.json({ error: 'Watch status is required' }, 400);
    }

    await watchstreamRepo.updateMovieStatus(id, movieId, watchStatus);
    return c.json({ success: true });
});

export default watchstreams;
