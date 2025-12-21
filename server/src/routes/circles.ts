import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { CircleRepository } from '../repositories/circle.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { AuthSession } from '../types/index.js';

const circles = new Hono();
const circleRepo = new CircleRepository();
const userRepo = new UserRepository();

// All routes require authentication
circles.use('/*', authMiddleware);

// Get user's circles
circles.get('/', async (c) => {
    const session = c.get('user') as AuthSession;
    const userCircles = await circleRepo.getUserCircles(session.userId);
    const pendingInvitations = await circleRepo.getPendingInvitations(session.userId);

    return c.json({
        ...userCircles,
        pendingInvitations,
    });
});

// Create circle
circles.post('/', async (c) => {
    const session = c.get('user') as AuthSession;
    const { name, description } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Name is required' }, 400);
    }

    const circle = await circleRepo.create(session.userId, name, description);
    return c.json({ circle }, 201);
});

// Get circle details
circles.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const circle = await circleRepo.getCircleDetails(id);

    if (!circle) {
        return c.json({ error: 'Circle not found' }, 404);
    }

    return c.json({ circle });
});

// Delete circle
circles.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    await circleRepo.delete(id);
    return c.json({ success: true });
});

// Invite member
circles.post('/:id/invite', async (c) => {
    const session = c.get('user') as AuthSession;
    const id = parseInt(c.req.param('id'));
    const { email } = await c.req.json();

    if (!email) {
        return c.json({ error: 'Email is required' }, 400);
    }

    // Find user by email
    const user = await userRepo.getUserByEmail(email);
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    const invitation = await circleRepo.inviteMember(id, user.id, session.userId);

    if (!invitation) {
        return c.json({ error: 'User already invited or is a member' }, 409);
    }

    return c.json({ success: true }, 201);
});

// Accept invitation
circles.post('/:id/accept', async (c) => {
    const session = c.get('user') as AuthSession;
    const id = parseInt(c.req.param('id'));

    await circleRepo.acceptInvitation(id, session.userId);
    return c.json({ success: true });
});

// Decline invitation
circles.post('/:id/decline', async (c) => {
    const session = c.get('user') as AuthSession;
    const id = parseInt(c.req.param('id'));

    await circleRepo.declineInvitation(id, session.userId);
    return c.json({ success: true });
});

// Remove member
circles.delete('/:id/members/:userId', async (c) => {
    const id = parseInt(c.req.param('id'));
    const userId = parseInt(c.req.param('userId'));

    await circleRepo.removeMember(id, userId);
    return c.json({ success: true });
});

// Get circle movies
circles.get('/:id/movies', async (c) => {
    const id = parseInt(c.req.param('id'));
    const movies = await circleRepo.getCircleMovies(id);
    return c.json({ movies });
});

// Add movie to circle
circles.post('/:id/movies', async (c) => {
    const session = c.get('user') as AuthSession;
    const id = parseInt(c.req.param('id'));
    const { movieTmdbId, recommendation, streamingPlatforms } = await c.req.json();

    if (!movieTmdbId) {
        return c.json({ error: 'Movie ID is required' }, 400);
    }

    // Verify user is a member or owner
    const circle = await circleRepo.getCircleDetails(id);
    if (!circle) {
        return c.json({ error: 'Circle not found' }, 404);
    }

    const isMember = circle.members.some(m => m.id === session.userId);
    if (!isMember) {
        return c.json({ error: 'Not a member of this circle' }, 403);
    }

    const result = await circleRepo.addMovieToCircle(id, movieTmdbId, session.userId, recommendation, streamingPlatforms);

    if (!result) {
        return c.json({ error: 'Movie already in circle' }, 409);
    }

    return c.json({ success: true }, 201);
});

// Remove movie from circle
circles.delete('/:id/movies/:movieId', async (c) => {
    const id = parseInt(c.req.param('id'));
    const movieId = parseInt(c.req.param('movieId'));

    await circleRepo.removeMovieFromCircle(id, movieId);
    return c.json({ success: true });
});

export default circles;
