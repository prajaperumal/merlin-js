import { prisma } from '../config/database.js';

export class WatchstreamRepository {
    /**
     * Get all watchstreams for a user
     */
    async getUserWatchstreams(userId: number) {
        return prisma.watchstream.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get watchstream by ID
     */
    async getById(id: number) {
        return prisma.watchstream.findUnique({
            where: { id },
        });
    }

    /**
     * Create a new watchstream
     */
    async create(userId: number, name: string) {
        try {
            return await prisma.watchstream.create({
                data: {
                    userId,
                    name,
                },
            });
        } catch (error: any) {
            // Handle unique constraint violation
            if (error.code === 'P2002') {
                return null; // Watchstream with this name already exists
            }
            throw error;
        }
    }

    /**
     * Rename a watchstream
     */
    async rename(id: number, name: string) {
        try {
            return await prisma.watchstream.update({
                where: { id },
                data: { name },
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return null; // Name already exists
            }
            throw error;
        }
    }

    /**
     * Delete a watchstream
     */
    async delete(id: number) {
        return prisma.watchstream.delete({
            where: { id },
        });
    }

    /**
     * Add movie to watchstream
     */
    async addMovie(watchstreamId: number, movieTmdbId: number, watchStatus: string = 'backlog') {
        try {
            return await prisma.watchstreamMovie.create({
                data: {
                    watchstreamId,
                    movieTmdbId,
                    watchStatus,
                },
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return null; // Movie already in watchstream
            }
            throw error;
        }
    }

    /**
     * Remove movie from watchstream
     */
    async removeMovie(watchstreamId: number, movieTmdbId: number) {
        return prisma.watchstreamMovie.deleteMany({
            where: {
                watchstreamId,
                movieTmdbId,
            },
        });
    }

    /**
     * Update movie watch status
     */
    async updateMovieStatus(watchstreamId: number, movieTmdbId: number, watchStatus: string) {
        return prisma.watchstreamMovie.updateMany({
            where: {
                watchstreamId,
                movieTmdbId,
            },
            data: {
                watchStatus,
            },
        });
    }

    /**
     * Get movies in watchstream by status
     */
    async getMoviesByStatus(watchstreamId: number, status: string) {
        const watchstreamMovies = await prisma.watchstreamMovie.findMany({
            where: {
                watchstreamId,
                watchStatus: status,
            },
            orderBy: {
                addedAt: 'desc',
            },
        });

        // Get movie details for each
        const movieIds = watchstreamMovies.map(wm => wm.movieTmdbId);
        const movies = await prisma.movie.findMany({
            where: {
                tmdbId: {
                    in: movieIds,
                },
            },
        });

        // Combine movie data with watch status
        return watchstreamMovies.map(wm => {
            const movie = movies.find(m => m.tmdbId === wm.movieTmdbId);
            return {
                ...movie,
                watchStatus: wm.watchStatus,
                addedAt: wm.addedAt,
            };
        });
    }
}
