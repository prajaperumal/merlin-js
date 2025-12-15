# Database Seed Script

This script populates the database with test data for easier development and testing.

## What It Creates

### Test User
- **Email**: `test@example.com`
- **Name**: Test User
- **Google ID**: `test-user-123`

### Additional Users (5)
- Alice Johnson (`alice@example.com`)
- Bob Smith (`bob@example.com`)
- Carol Williams (`carol@example.com`)
- David Brown (`david@example.com`)
- Emma Davis (`emma@example.com`)

### Movies (10)
Popular movies across different genres:
- The Matrix (1999)
- The Dark Knight (2008)
- Inception (2010)
- Interstellar (2014)
- The Shawshank Redemption (1994)
- The Godfather (1972)
- Forrest Gump (1994)
- Pulp Fiction (1994)
- The Shining (1980)
- Seven (1995)

### Watchstreams (6)
All owned by the test user, each with 2 movies:
1. **Action Favorites** - The Matrix, The Dark Knight
2. **Sci-Fi Classics** - Inception, Interstellar
3. **Drama Must-Watch** - Shawshank, Godfather
4. **Comedy Collection** - Forrest Gump, Pulp Fiction
5. **Horror Night** - The Shining, Seven
6. **Weekend Picks** - Mixed selection

### Circles (6)
All owned by the test user, with varying member counts:
1. **Movie Buffs** (3 members) - Alice, Bob, Carol
2. **Sci-Fi Fans** (2 members) - Alice, David
3. **Horror Club** (4 members) - Bob, Carol, David, Emma
4. **Classic Cinema** (2 members) - Carol, Emma
5. **Weekend Warriors** (3 members) - Alice, Bob, Emma
6. **Film Critics** (1 member) - David

## How to Run

```bash
cd server
npm run db:seed
```

## What It Does

1. **Cleans existing data** - Removes all existing users, movies, watchstreams, and circles
2. **Creates test user** - Sets up the main test user account
3. **Creates additional users** - Adds 5 more users for circle membership
4. **Creates movies** - Adds 10 popular movies with TMDB data
5. **Creates watchstreams** - Sets up 6 watchstreams with movies
6. **Creates circles** - Sets up 6 circles with members

## Using the Test User

⚠️ **Important**: This seed script creates a test user with Google ID `test-user-123`. To use this user for testing, you'll need to bypass Google OAuth in development.

### Option 1: Manual Database Session (Quick Testing)

You can manually create a session in the database for quick testing:

```sql
-- Insert a session for the test user
-- Note: You'll need to implement session storage if not already done
```

### Option 2: Modify Auth Middleware (Development Only)

Add a development bypass in your auth middleware:

```typescript
// In auth.middleware.ts (development only!)
if (process.env.NODE_ENV === 'development' && req.headers['x-test-user']) {
    // Use test user
    return next();
}
```

### Option 3: Use Prisma Studio

1. Run `npm run db:studio`
2. View and verify the seeded data
3. Manually test API endpoints with the test user ID

## Verifying the Seed

After running the seed script, you should see:
- ✅ 6 users total (1 test user + 5 additional)
- ✅ 10 movies
- ✅ 6 watchstreams with movies
- ✅ 6 circles with members

You can verify this by:
1. Running `npm run db:studio` to view the data
2. Checking the console output from the seed script
3. Making API calls to verify the data is accessible

## Resetting Data

To reset and re-seed the database:

```bash
npm run db:seed
```

The script automatically cleans existing data before seeding, so you can run it multiple times safely.
