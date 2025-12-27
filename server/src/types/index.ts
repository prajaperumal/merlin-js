export interface User {
    id: number;
    googleId: string;
    email: string;
    name: string | null;
    picture: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
}

export interface Movie {
    id: number;
    dataProviderId: number;
    dataProvider: string;
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
    genreIds?: number[];
}

export interface TMDBMovie {
    id: number;
    title: string;
    original_title?: string;
    overview?: string;
    release_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    original_language?: string;
    adult?: boolean;
    genre_ids?: number[];
}

export interface Watchstream {
    id: number;
    userId: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StreamingPlatform {
    name: string;
    logo?: string;
}

export interface WatchstreamMovie {
    id: number;
    watchstreamId: number;
    movieId: number;
    watchStatus: 'backlog' | 'watched';
    streamingPlatforms?: StreamingPlatform[];
    addedAt: Date;
}

export interface Circle {
    id: number;
    name: string;
    ownerUserId: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CircleMember {
    id: number;
    circleId: number;
    userId: number;
    status: 'pending' | 'accepted' | 'declined';
    invitedBy: number;
    invitedAt: Date;
    joinedAt?: Date;
}

export interface CircleMovie {
    id: number;
    circleId: number;
    movieId: number;
    addedBy: number;
    recommendation?: string;
    streamingPlatforms?: StreamingPlatform[];
    addedAt: Date;
}

export interface AuthSession {
    userId: number;
    email: string;
    name: string | null;
    picture: string | null;
}
