import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Find existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.notification.deleteMany();
    await prisma.watchstreamMovie.deleteMany();
    await prisma.circleMember.deleteMany();
    await prisma.circle.deleteMany();
    await prisma.watchstream.deleteMany();
    await prisma.movie.deleteMany();

    // Find or create your user account
    console.log('👥 Finding or creating your user account...');
    const testUser = await prisma.user.upsert({
        where: { email: 'prasanna.raj@gmail.com' },
        update: {},
        create: {
            googleId: 'prasanna-google-id',
            email: 'prasanna.raj@gmail.com',
            name: 'Prasanna Rajaperumal',
            picture: 'https://i.pravatar.cc/150?img=1',
        },
    });

    console.log(`✅ Using user: ${testUser.name} (${testUser.email})`);

    // Create additional test users for circles
    console.log('👥 Creating additional test users...');
    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'alice@example.com' },
            update: {},
            create: {
                googleId: 'user-2',
                email: 'alice@example.com',
                name: 'Alice Johnson',
                picture: 'https://i.pravatar.cc/150?img=2',
            },
        }),
        prisma.user.upsert({
            where: { email: 'bob@example.com' },
            update: {},
            create: {
                googleId: 'user-3',
                email: 'bob@example.com',
                name: 'Bob Smith',
                picture: 'https://i.pravatar.cc/150?img=3',
            },
        }),
        prisma.user.upsert({
            where: { email: 'carol@example.com' },
            update: {},
            create: {
                googleId: 'user-4',
                email: 'carol@example.com',
                name: 'Carol Williams',
                picture: 'https://i.pravatar.cc/150?img=4',
            },
        }),
        prisma.user.upsert({
            where: { email: 'david@example.com' },
            update: {},
            create: {
                googleId: 'user-5',
                email: 'david@example.com',
                name: 'David Brown',
                picture: 'https://i.pravatar.cc/150?img=5',
            },
        }),
        prisma.user.upsert({
            where: { email: 'emma@example.com' },
            update: {},
            create: {
                googleId: 'user-6',
                email: 'emma@example.com',
                name: 'Emma Davis',
                picture: 'https://i.pravatar.cc/150?img=6',
            },
        }),
    ]);

    // Create sample movies
    console.log('🎬 Creating sample movies...');
    const movies = await Promise.all([
        // Action Movies
        prisma.movie.create({
            data: {
                dataProviderId: 603,
                title: 'The Matrix',
                year: '1999',
                overview: 'A computer hacker learns about the true nature of reality.',
                posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                voteAverage: 8.2,
            },
        }),
        prisma.movie.create({
            data: {
                dataProviderId: 155,
                title: 'The Dark Knight',
                year: '2008',
                overview: 'Batman faces the Joker in Gotham City.',
                posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                voteAverage: 9.0,
            },
        }),
        // Sci-Fi
        prisma.movie.create({
            data: {
                dataProviderId: 27205,
                title: 'Inception',
                year: '2010',
                overview: 'A thief who steals corporate secrets through dream-sharing technology.',
                posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                voteAverage: 8.4,
            },
        }),
        prisma.movie.create({
            data: {
                dataProviderId: 157336,
                title: 'Interstellar',
                year: '2014',
                overview: 'A team of explorers travel through a wormhole in space.',
                posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                voteAverage: 8.6,
            },
        }),
        // Drama
        prisma.movie.create({
            data: {
                dataProviderId: 278,
                title: 'The Shawshank Redemption',
                year: '1994',
                overview: 'Two imprisoned men bond over a number of years.',
                posterPath: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                voteAverage: 9.3,
            },
        }),
        prisma.movie.create({
            data: {
                dataProviderId: 238,
                title: 'The Godfather',
                year: '1972',
                overview: 'The aging patriarch of an organized crime dynasty transfers control.',
                posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                voteAverage: 9.2,
            },
        }),
        // Comedy
        prisma.movie.create({
            data: {
                dataProviderId: 13,
                title: 'Forrest Gump',
                year: '1994',
                overview: 'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.',
                posterPath: '/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
                voteAverage: 8.5,
            },
        }),
        prisma.movie.create({
            data: {
                dataProviderId: 680,
                title: 'Pulp Fiction',
                year: '1994',
                overview: 'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.',
                posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
                voteAverage: 8.9,
            },
        }),
        // Horror
        prisma.movie.create({
            data: {
                dataProviderId: 694,
                title: 'The Shining',
                year: '1980',
                overview: 'A family heads to an isolated hotel for the winter.',
                posterPath: '/xazWoLealQwEgqZ89MLZklLZD3k.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/xazWoLealQwEgqZ89MLZklLZD3k.jpg',
                voteAverage: 8.2,
            },
        }),
        prisma.movie.create({
            data: {
                dataProviderId: 346,
                title: 'Seven',
                year: '1995',
                overview: 'Two detectives hunt a serial killer who uses the seven deadly sins.',
                posterPath: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
                posterUrl: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg',
                voteAverage: 8.3,
            },
        }),
    ]);

    // Create watchstreams for test user
    console.log('📺 Creating watchstreams...');
    const watchstreams = await Promise.all([
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Action Favorites',
            },
        }),
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Sci-Fi Classics',
            },
        }),
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Drama Must-Watch',
            },
        }),
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Comedy Collection',
            },
        }),
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Horror Night',
            },
        }),
        prisma.watchstream.create({
            data: {
                userId: testUser.id,
                name: 'Weekend Picks',
            },
        }),
    ]);

    // Add movies to watchstreams
    console.log('🎥 Adding movies to watchstreams...');
    await Promise.all([
        // Action Favorites
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[0].id,
                movieId: movies[0].id, // The Matrix
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[0].id,
                movieId: movies[1].id, // The Dark Knight
                watchStatus: 'backlog',
            },
        }),
        // Sci-Fi Classics
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[1].id,
                movieId: movies[2].id, // Inception
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[1].id,
                movieId: movies[3].id, // Interstellar
                watchStatus: 'backlog',
            },
        }),
        // Drama Must-Watch
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[2].id,
                movieId: movies[4].id, // Shawshank
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[2].id,
                movieId: movies[5].id, // Godfather
                watchStatus: 'backlog',
            },
        }),
        // Comedy Collection
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[3].id,
                movieId: movies[6].id, // Forrest Gump
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[3].id,
                movieId: movies[7].id, // Pulp Fiction
                watchStatus: 'backlog',
            },
        }),
        // Horror Night
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[4].id,
                movieId: movies[8].id, // The Shining
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[4].id,
                movieId: movies[9].id, // Seven
                watchStatus: 'backlog',
            },
        }),
        // Weekend Picks - mix of all
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[5].id,
                movieId: movies[0].id,
                watchStatus: 'backlog',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[5].id,
                movieId: movies[2].id,
                watchStatus: 'backlog',
            },
        }),
    ]);

    // Create circles
    console.log('⭕ Creating circles...');
    const circles = await Promise.all([
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Movie Buffs',
                description: 'For serious movie enthusiasts',
            },
        }),
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Sci-Fi Fans',
                description: 'Science fiction lovers unite',
            },
        }),
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Horror Club',
                description: 'For those who love a good scare',
            },
        }),
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Classic Cinema',
                description: 'Appreciating timeless films',
            },
        }),
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Weekend Warriors',
                description: 'Casual movie watchers',
            },
        }),
        prisma.circle.create({
            data: {
                ownerUserId: testUser.id,
                name: 'Film Critics',
                description: 'Analyzing and discussing films',
            },
        }),
    ]);

    // Add members to circles
    console.log('👥 Adding members to circles...');
    await Promise.all([
        // Movie Buffs - 3 members
        prisma.circleMember.create({
            data: {
                circleId: circles[0].id,
                userId: users[0].id, // Alice
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[0].id,
                userId: users[1].id, // Bob
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[0].id,
                userId: users[2].id, // Carol
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        // Sci-Fi Fans - 2 members
        prisma.circleMember.create({
            data: {
                circleId: circles[1].id,
                userId: users[0].id, // Alice
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[1].id,
                userId: users[3].id, // David
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        // Horror Club - 4 members
        prisma.circleMember.create({
            data: {
                circleId: circles[2].id,
                userId: users[1].id, // Bob
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[2].id,
                userId: users[2].id, // Carol
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[2].id,
                userId: users[3].id, // David
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[2].id,
                userId: users[4].id, // Emma
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        // Classic Cinema - 2 members
        prisma.circleMember.create({
            data: {
                circleId: circles[3].id,
                userId: users[2].id, // Carol
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[3].id,
                userId: users[4].id, // Emma
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        // Weekend Warriors - 3 members
        prisma.circleMember.create({
            data: {
                circleId: circles[4].id,
                userId: users[0].id, // Alice
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[4].id,
                userId: users[1].id, // Bob
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.circleMember.create({
            data: {
                circleId: circles[4].id,
                userId: users[4].id, // Emma
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
        // Film Critics - 1 member
        prisma.circleMember.create({
            data: {
                circleId: circles[5].id,
                userId: users[3].id, // David
                invitedBy: testUser.id,
                status: 'accepted',
                joinedAt: new Date(),
            },
        }),
    ]);

    // Add movies to circles with recommendations
    console.log('🎬 Adding movies to circles with recommendations...');
    await Promise.all([
        // Movie Buffs - diverse selection
        prisma.circleMovie.create({
            data: {
                circleId: circles[0].id,
                movieId: movies[0].id, // The Matrix
                addedBy: testUser.id,
                recommendation: "Mind-bending sci-fi that changed cinema forever. The action sequences are still incredible!",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[0].id,
                movieId: movies[4].id, // Shawshank
                addedBy: users[0].id, // Alice
                recommendation: "One of the greatest films ever made. The story of hope and friendship will stay with you forever.",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[0].id,
                movieId: movies[5].id, // Godfather
                addedBy: users[1].id, // Bob
            },
        }),
        // Sci-Fi Fans
        prisma.circleMovie.create({
            data: {
                circleId: circles[1].id,
                movieId: movies[2].id, // Inception
                addedBy: testUser.id,
                recommendation: "Nolan at his best! Every time you watch it, you discover something new. The dream sequences are perfection.",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[1].id,
                movieId: movies[3].id, // Interstellar
                addedBy: users[0].id, // Alice
                recommendation: "Brings tears to my eyes every time. The science is fascinating and the emotional core is powerful.",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[1].id,
                movieId: movies[0].id, // The Matrix
                addedBy: users[3].id, // David
                recommendation: "The OG of modern sci-fi. Take the red pill!",
            },
        }),
        // Horror Club
        prisma.circleMovie.create({
            data: {
                circleId: circles[2].id,
                movieId: movies[8].id, // The Shining
                addedBy: testUser.id,
                recommendation: "Kubrick's masterpiece. Atmospheric, terrifying, and unforgettable. All work and no play...",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[2].id,
                movieId: movies[9].id, // Seven
                addedBy: users[1].id, // Bob
                recommendation: "Dark, disturbing, and brilliant. The ending will haunt you. What's in the box?!",
            },
        }),
        // Classic Cinema
        prisma.circleMovie.create({
            data: {
                circleId: circles[3].id,
                movieId: movies[5].id, // Godfather
                addedBy: testUser.id,
                recommendation: "The definition of a masterpiece. Every frame is perfect. An offer you can't refuse!",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[3].id,
                movieId: movies[4].id, // Shawshank
                addedBy: users[2].id, // Carol
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[3].id,
                movieId: movies[6].id, // Forrest Gump
                addedBy: users[4].id, // Emma
                recommendation: "Life is like a box of chocolates... This movie has it all: humor, heart, and history.",
            },
        }),
        // Weekend Warriors
        prisma.circleMovie.create({
            data: {
                circleId: circles[4].id,
                movieId: movies[1].id, // Dark Knight
                addedBy: testUser.id,
                recommendation: "Perfect weekend watch! Heath Ledger's Joker is iconic. Why so serious?",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[4].id,
                movieId: movies[7].id, // Pulp Fiction
                addedBy: users[0].id, // Alice
                recommendation: "Tarantino's best work. Non-linear storytelling at its finest. Say 'what' again!",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[4].id,
                movieId: movies[6].id, // Forrest Gump
                addedBy: users[4].id, // Emma
            },
        }),
        // Film Critics
        prisma.circleMovie.create({
            data: {
                circleId: circles[5].id,
                movieId: movies[2].id, // Inception
                addedBy: testUser.id,
                recommendation: "Technically brilliant with layers of meaning. The practical effects are outstanding. A study in filmmaking.",
            },
        }),
        prisma.circleMovie.create({
            data: {
                circleId: circles[5].id,
                movieId: movies[5].id, // Godfather
                addedBy: users[3].id, // David
                recommendation: "The pinnacle of American cinema. Coppola's direction, Brando's performance - everything is perfect.",
            },
        }),
    ]);

    // Add discussion comments to movies
    console.log('💬 Adding discussion comments to movies...');
    const allCircleMovies = await prisma.circleMovie.findMany();

    const discussions = [
        "Has anyone watched the sequel?",
        "I still think about that ending. So deep.",
        "The cinematography in this is just breathtaking.",
        "Alice, we should totally watch this next weekend!",
        "Bob, you're 100% right about the soundtrack. It's legendary.",
        "Can we talk about the plot twist? I did not see that coming.",
        "Is this version the extended cut or the theatrical one?",
        "I've seen this 5 times and it never gets old.",
        "The acting is top-notch, especially the lead role.",
        "Perfect for a movie night!",
        "Wait, did I miss something? Why did the character do that?",
        "The special effects were ahead of their time.",
    ];

    for (const cm of allCircleMovies) {
        // Add 2-4 random comments to each movie
        const commentCount = Math.floor(Math.random() * 3) + 2;
        const shuffledUsers = [...users, testUser].sort(() => 0.5 - Math.random());

        for (let i = 0; i < commentCount; i++) {
            await prisma.circleMovieComment.create({
                data: {
                    circleMovieId: cm.id,
                    userId: shuffledUsers[i % shuffledUsers.length].id,
                    content: discussions[Math.floor(Math.random() * discussions.length)],
                    createdAt: new Date(Date.now() - Math.random() * 10000000), // Random time in the past
                }
            });
        }
    }

    // Add sample notifications
    console.log('🔔 Creating sample notifications...');
    await Promise.all([
        // Circle invitations
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'circle_invite',
                title: 'Circle Invitation',
                message: `Alice Johnson invited you to join "Movie Buffs"`,
                metadata: {
                    circleName: 'Movie Buffs',
                    inviterName: 'Alice Johnson',
                    circleId: circles[0].id,
                },
                link: `/circles/${circles[0].id}`,
                read: false,
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            },
        }),
        // Invitation accepted
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'invite_accepted',
                title: 'Invitation Accepted',
                message: `Bob Smith joined your circle "Horror Club"`,
                metadata: {
                    circleName: 'Horror Club',
                    accepterName: 'Bob Smith',
                    circleId: circles[2].id,
                },
                link: `/circles/${circles[2].id}`,
                read: false,
                createdAt: new Date(Date.now() - 7200000), // 2 hours ago
            },
        }),
        // Movie recommended
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'movie_recommended',
                title: 'New Movie Recommendation',
                message: `Alice Johnson recommended "The Shawshank Redemption" in "Movie Buffs"`,
                metadata: {
                    movieTitle: 'The Shawshank Redemption',
                    recommenderName: 'Alice Johnson',
                    circleName: 'Movie Buffs',
                    circleId: circles[0].id,
                },
                link: `/circles/${circles[0].id}`,
                read: false,
                createdAt: new Date(Date.now() - 10800000), // 3 hours ago
            },
        }),
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'movie_recommended',
                title: 'New Movie Recommendation',
                message: `David Brown recommended "The Matrix" in "Sci-Fi Fans"`,
                metadata: {
                    movieTitle: 'The Matrix',
                    recommenderName: 'David Brown',
                    circleName: 'Sci-Fi Fans',
                    circleId: circles[1].id,
                },
                link: `/circles/${circles[1].id}`,
                read: true,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
        }),
        // Comments
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'comment_added',
                title: 'New Comment',
                message: `Carol Williams commented on "Inception" in "Sci-Fi Fans"`,
                metadata: {
                    commenterName: 'Carol Williams',
                    movieTitle: 'Inception',
                    circleName: 'Sci-Fi Fans',
                    circleId: circles[1].id,
                },
                link: `/circles/${circles[1].id}`,
                read: false,
                createdAt: new Date(Date.now() - 14400000), // 4 hours ago
            },
        }),
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'comment_added',
                title: 'New Comment',
                message: `Emma Davis commented on "The Godfather" in "Classic Cinema"`,
                metadata: {
                    commenterName: 'Emma Davis',
                    movieTitle: 'The Godfather',
                    circleName: 'Classic Cinema',
                    circleId: circles[3].id,
                },
                link: `/circles/${circles[3].id}`,
                read: true,
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
            },
        }),
        // More recent notifications
        prisma.notification.create({
            data: {
                userId: testUser.id,
                type: 'invite_accepted',
                title: 'Invitation Accepted',
                message: `Emma Davis joined your circle "Classic Cinema"`,
                metadata: {
                    circleName: 'Classic Cinema',
                    accepterName: 'Emma Davis',
                    circleId: circles[3].id,
                },
                link: `/circles/${circles[3].id}`,
                read: false,
                createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
            },
        }),
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Using your account: ${testUser.email}`);
    console.log(`   - Created 5 additional users for circles`);
    console.log(`   - Created 10 sample movies`);
    console.log(`   - Created 6 watchstreams with movies`);
    console.log(`   - Created 6 circles with members`);
    console.log(`   - Added 16 movies to circles with recommendations`);
    console.log(`   - Created 7 sample notifications`);
    console.log('\n🎉 Refresh your browser to see the data!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
