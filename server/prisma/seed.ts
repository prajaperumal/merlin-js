import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Find existing data
    console.log('🧹 Cleaning existing data...');
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
                tmdbId: 603,
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
                tmdbId: 155,
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
                tmdbId: 27205,
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
                tmdbId: 157336,
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
                tmdbId: 278,
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
                tmdbId: 238,
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
                tmdbId: 13,
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
                tmdbId: 680,
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
                tmdbId: 694,
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
                tmdbId: 346,
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
                movieTmdbId: movies[0].tmdbId, // The Matrix
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[0].id,
                movieTmdbId: movies[1].tmdbId, // The Dark Knight
                watchStatus: 'backlog',
            },
        }),
        // Sci-Fi Classics
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[1].id,
                movieTmdbId: movies[2].tmdbId, // Inception
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[1].id,
                movieTmdbId: movies[3].tmdbId, // Interstellar
                watchStatus: 'backlog',
            },
        }),
        // Drama Must-Watch
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[2].id,
                movieTmdbId: movies[4].tmdbId, // Shawshank
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[2].id,
                movieTmdbId: movies[5].tmdbId, // Godfather
                watchStatus: 'backlog',
            },
        }),
        // Comedy Collection
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[3].id,
                movieTmdbId: movies[6].tmdbId, // Forrest Gump
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[3].id,
                movieTmdbId: movies[7].tmdbId, // Pulp Fiction
                watchStatus: 'backlog',
            },
        }),
        // Horror Night
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[4].id,
                movieTmdbId: movies[8].tmdbId, // The Shining
                watchStatus: 'watched',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[4].id,
                movieTmdbId: movies[9].tmdbId, // Seven
                watchStatus: 'backlog',
            },
        }),
        // Weekend Picks - mix of all
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[5].id,
                movieTmdbId: movies[0].tmdbId,
                watchStatus: 'backlog',
            },
        }),
        prisma.watchstreamMovie.create({
            data: {
                watchstreamId: watchstreams[5].id,
                movieTmdbId: movies[2].tmdbId,
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

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Using your account: ${testUser.email}`);
    console.log(`   - Created 5 additional users for circles`);
    console.log(`   - Created 10 sample movies`);
    console.log(`   - Created 6 watchstreams with movies`);
    console.log(`   - Created 6 circles with members`);
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
