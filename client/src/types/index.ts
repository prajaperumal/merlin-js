export interface User {
    id: number;
    googleId: string;
    email: string;
    name: string | null;
    picture: string | null;
}

export interface StreamingPlatform {
    name: string;
    logo?: string;
}

export interface Movie {
    id: number;
    dataProviderId: number;
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
    watchStatus?: 'backlog' | 'watched';
    streamingPlatforms?: StreamingPlatform[];
    addedAt?: string;
    circleMovieId?: number;
}

export interface WatchstreamMovie {
    id: number;
    watchstreamId: number;
    movieId: number;
    watchStatus: 'backlog' | 'watched';
    streamingPlatforms?: StreamingPlatform[];
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

export interface Notification {
    id: number;
    userId: number;
    type: 'circle_invite' | 'invite_accepted' | 'movie_recommended' | 'comment_added';
    title: string;
    message: string;
    metadata?: {
        circleName?: string;
        movieTitle?: string;
        userName?: string;
        circleId?: number;
        movieId?: number;
    };
    link?: string;
    read: boolean;
    createdAt: string;
}
