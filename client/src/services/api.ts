import type { User, Movie, Watchstream, Circle, CircleMember, CircleInvitation, StreamingPlatform } from '../types';

const API_BASE = '/api';

class ApiService {
    // Auth
    async getGoogleAuthUrl(): Promise<string> {
        const res = await fetch(`${API_BASE}/auth/google/url`);
        const data = await res.json();
        return data.url;
    }

    async handleGoogleCallback(code: string): Promise<User> {
        const res = await fetch(`${API_BASE}/auth/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
            credentials: 'include',
        });
        const data = await res.json();
        return data.user;
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
            if (!res.ok) return null;
            const data = await res.json();
            return data.user;
        } catch {
            return null;
        }
    }

    async logout(): Promise<void> {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    }

    // Movies
    async searchMovies(query: string): Promise<Movie[]> {
        const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        return data.movies;
    }

    async getMovieDetails(id: number): Promise<Movie> {
        const res = await fetch(`${API_BASE}/movies/${id}`);
        const data = await res.json();
        return data.movie;
    }

    // Watchstreams
    async getWatchstreams(): Promise<Watchstream[]> {
        const res = await fetch(`${API_BASE}/watchstreams`, { credentials: 'include' });
        const data = await res.json();
        return data.watchstreams;
    }

    async createWatchstream(name: string): Promise<Watchstream> {
        const res = await fetch(`${API_BASE}/watchstreams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.watchstream;
    }

    async renameWatchstream(id: number, name: string): Promise<Watchstream> {
        const res = await fetch(`${API_BASE}/watchstreams/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.watchstream;
    }

    async deleteWatchstream(id: number): Promise<void> {
        await fetch(`${API_BASE}/watchstreams/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    async getWatchstreamMovies(id: number, status: string): Promise<Movie[]> {
        const res = await fetch(`${API_BASE}/watchstreams/${id}/movies?status=${status}`, {
            credentials: 'include',
        });
        const data = await res.json();
        return data.movies;
    }

    async addMovieToWatchstream(watchstreamId: number, movieTmdbId: number, watchStatus: string, streamingPlatforms?: StreamingPlatform[]): Promise<void> {
        const res = await fetch(`${API_BASE}/watchstreams/${watchstreamId}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieTmdbId, watchStatus, streamingPlatforms }),
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
    }

    async removeMovieFromWatchstream(watchstreamId: number, movieTmdbId: number): Promise<void> {
        await fetch(`${API_BASE}/watchstreams/${watchstreamId}/movies/${movieTmdbId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    async updateMovieStatus(watchstreamId: number, movieTmdbId: number, watchStatus: string, streamingPlatforms?: StreamingPlatform[]): Promise<void> {
        await fetch(`${API_BASE}/watchstreams/${watchstreamId}/movies/${movieTmdbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ watchStatus, streamingPlatforms }),
            credentials: 'include',
        });
    }

    // Circles
    async getCircles(): Promise<{ owned: Circle[]; member: Circle[]; pendingInvitations: CircleInvitation[] }> {
        const res = await fetch(`${API_BASE}/circles`, { credentials: 'include' });
        const data = await res.json();
        return data;
    }

    async createCircle(name: string, description?: string): Promise<Circle> {
        const res = await fetch(`${API_BASE}/circles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description }),
            credentials: 'include',
        });
        const data = await res.json();
        return data.circle;
    }

    async getCircleDetails(id: number): Promise<{ circle: Circle & { members: CircleMember[] } }> {
        const res = await fetch(`${API_BASE}/circles/${id}`, { credentials: 'include' });
        const data = await res.json();
        return data;
    }

    async deleteCircle(id: number): Promise<void> {
        await fetch(`${API_BASE}/circles/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    async inviteMember(circleId: number, email: string): Promise<void> {
        const res = await fetch(`${API_BASE}/circles/${circleId}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
    }

    async acceptInvitation(circleId: number): Promise<void> {
        const res = await fetch(`${API_BASE}/circles/${circleId}/accept`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to accept invitation');
        }
    }

    async declineInvitation(circleId: number): Promise<void> {
        const res = await fetch(`${API_BASE}/circles/${circleId}/decline`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to decline invitation');
        }
    }

    async removeMember(circleId: number, userId: number): Promise<void> {
        await fetch(`${API_BASE}/circles/${circleId}/members/${userId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    async getCircleMovies(circleId: number): Promise<Movie[]> {
        const res = await fetch(`${API_BASE}/circles/${circleId}/movies`, {
            credentials: 'include',
        });
        const data = await res.json();
        return data.movies;
    }

    async addMovieToCircle(circleId: number, movieTmdbId: number, recommendation?: string): Promise<void> {
        const res = await fetch(`${API_BASE}/circles/${circleId}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieTmdbId, recommendation }),
            credentials: 'include',
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
    }

    async removeMovieFromCircle(circleId: number, movieTmdbId: number): Promise<void> {
        await fetch(`${API_BASE}/circles/${circleId}/movies/${movieTmdbId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    async getCircleMovieComments(circleMovieId: number): Promise<any[]> {
        const res = await fetch(`${API_BASE}/circles/movies/${circleMovieId}/comments`, {
            credentials: 'include',
        });
        const data = await res.json();
        return data.comments;
    }

    async addCircleMovieComment(circleMovieId: number, content: string): Promise<any> {
        const res = await fetch(`${API_BASE}/circles/movies/${circleMovieId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.comment;
    }
}

export const api = new ApiService();
