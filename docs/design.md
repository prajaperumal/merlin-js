# Merlin - Movie Social App Design Documentation

## Overview

**Merlin** is a social movie discovery and tracking platform that enables friends to share movie recommendations in private circles, maintain personal watchlists, and discuss movies together. Merlin combines personal movie tracking with collaborative circle-based recommendations. Think of it as "Goodreads for movies" with a social twist.


## Core Value Proposition

**For Movie Enthusiasts:** "Share what you're watching with friends, discover curated recommendations, and discuss movies in real-time"

### Key Benefits
- Curated recommendations from people you know well (eventually from AI) and trust (not recommendation algorithms based on watch history)
- Track movies you always wanted to watch in curated watchstreams with status tracking
- Async social interactions and group discussions around movies

---

## Application Architecture

### User Model
- Google OAuth 2.0 authentication
- Profile: name, email, picture, Google ID
- Account tracking: creation timestamp, last login

### Data Relationships
```
User
├── owns → Circle[] (as owner)
├── member of → CircleMember[]
├── recommends → CircleMovie[]
├── creates → Watchstream[] (personal lists)
├── posts → CircleMovieComment[]
└── invites → CircleInvitation[]

Circle
├── has members → CircleMember[]
├── contains → CircleMovie[]
├── has pending → CircleInvitation[]
└── owned by → User

Watchstream
├── contains → WatchstreamMovie[]
└── belongs to → User

Movie (cached from TMDB)
├── in → CircleMovie[]
├── in → WatchstreamMovie[]
└── has → CircleMovieComment[]
```

---

## Main Features & User Flows

The app has **two distinct modes** accessible from the main header:

#### Mode 1: Discover (Circle-Based Discovery)

**Purpose:** View and interact with movie recommendations shared by friends in circles

**User Actions:**
1. Create circles (e.g., "Film Critics", "Horror Club")
2. Invite members via email
3. Add movies (Search through movie provider API (e.g. TMDB)) to the circle with reason/recommendation text
4. Save recommended movie to personal watchstream
5. Have circle level discussion threads (common interests) or movie level discussion threadsa within each circle

**Social Dynamics:**
- Owner can invite members
- All members in the circle can add movies
- Recommendations are highlighted prominently. Interactions involve upvote/downvote recommendations or commenting on it. 
- User avatars create personal connection

---

#### Mode 2: Watchstream (Individual Movie Lists))

**Purpose:** Maintain organized personal watchlists with status tracking

User Actions:

Create watchstreams (e.g., "Date Night Movies", "Classic Films")
Search and add movies from TMDB database
Mark movies as "Backlog" (want to watch) or "Watched"
Tag streaming platforms (Netflix, Disney+, etc.)
Move movies from backlog → watched
Remove movies from lists

**User Actions:**
1. **Create Watchstream** - Add new named watchlist (e.g., "Date Night Movies", "Classic Films")
2. **Add Movies** - Search a movie provider API (e.g. TMDB) and add with:
   - Watch status (backlog/watched)
3. **Mark Watched** - Move from backlog to watched
4. **Recommend** - Share from personal list to circles
5. **Record** - Record my review of the movie for tracking


---

### 2. Circles Feature (Social/Collaborative)

#### Data Structure
```
Circle
├── id, name, description
├── ownerUserId (creator)
├── createdAt, updatedAt
├── members: CircleMember[]
├── movies: CircleMovie[]
└── invitations: CircleInvitation[]

CircleMember
├── circleId, userId
├── status: 'pending' | 'accepted'
├── invitedBy, invitedAt, joinedAt

CircleMovie
├── circleId, movieId
├── addedBy (userId)
├── recommendation (optional text)
├── streamingPlatforms
└── comments: CircleMovieComment[]
```


## Key User Flows by Scenario

### Flow 1: Discover via circle's Recommendation
### Flow 2: Find & Share with Friends
### Flow 3: Group Discussion
### Flow 4: Invite Friend to Circle

---

## User Roles & Capabilities

### New User
- Sign in with Google
- Create circles 
- Invite friends via email
- Build personal watchstreams

### Circle Owner
- Create circles
- Invite members (existing or new users)
- Add movies to circle
- Remove members
- View member activity
- Participate in discussions - React to recommendations

### Circle Member
- Join via invitations
- View recommended movies
- Add own recommendations to the circle
- Discuss movies - React to recommendations
- Add circle movies to personal watchstreams
- Re-recommend to other circles

### Casual User
- Maintain personal watchstreams without circles
- Search and track movies
- Mark watched/unwatched
- Browse solo (no social features needed)

