export interface User {
    id: number;
    googleId: string;
    email: string;
    name: string | null;
    picture: string | null;
}

export interface Movie {
    id: number;
    tmdbId: number;
    title: string;
    originalTitle?: string;
    overview?: string;
    releaseDate?: string;
    year?: string;
    posterPath?: string;
    posterUrl?: string;
    backdropPath?: string;
    backdropUrl?: string;
    voteAverage?: number;
    voteCount?: number;
    popularity?: number;
    originalLanguage?: string;
    adult?: boolean;
    genreIds?: number[];
    watchStatus?: 'backlog' | 'watched';
    addedAt?: string;
}

export interface WatchstreamMovie {
    id: number;
    watchstreamId: number;
    movieTmdbId: number;
    watchStatus: 'backlog' | 'watched';
    addedAt: Date;
}

export interface Watchstream {
    id: number;
    userId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Circle {
    id: number;
    name: string;
    ownerUserId: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
    isOwner?: boolean;
}

export interface CircleMember {
    id: number;
    email: string;
    name: string | null;
    picture: string | null;
    isOwner: boolean;
}

export interface CircleInvitation {
    id: number;
    circleId: number;
    circle: Circle;
    status: string;
    invitedAt: string;
}
