import { test, expect } from './fixtures';

test.describe('Movie Discussion Flow', () => {
    test('should allow a user to start and participate in a movie discussion', async ({ authenticatedPage: page }) => {
        // 1. Create a personal circle (to ensure we have a clean state)
        await page.goto('/circles');
        const circleName = `Test Circle ${Date.now()}`;

        // Handle both "Create Your First Circle" (empty state) and "Create Circle" (non-empty state)
        const createBtn = page.getByRole('button', { name: /Create.*Circle/i });
        await expect(createBtn).toBeVisible({ timeout: 15000 });
        await createBtn.click();

        await page.getByPlaceholder(/Circle name/i).fill(circleName);
        await page.getByRole('button', { name: /^Create$/i }).click();

        // 2. Navigate to the circle detail
        await page.getByText(circleName).click();
        await expect(page.getByText(circleName)).toBeVisible();

        // 3. Add a movie to this circle
        await page.locator('button[class*="fab"]').click();
        await page.getByRole('button', { name: /Add Movie/i, exact: false }).click();

        const searchModal = page.locator('div[class*="modal"]');
        await searchModal.getByPlaceholder(/Search for movies/i).fill('Inception');

        // Wait for search result and add
        const addButton = searchModal.locator('button[class*="addButton"]').first();
        await expect(addButton).toBeVisible({ timeout: 15000 });
        await addButton.click({ force: true });

        // Fill recommendation (optional but good for test coverage)
        await page.getByPlaceholder(/Share why you think this movie is worth watching/i).fill('Best sci-fi ever!');
        await page.getByRole('button', { name: /Add to Circle/i }).click();

        // Verify movie is in the circle
        await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 15000 });

        // 4. Click the movie tile to open discussion
        const movieTile = page.locator('div[class*="movieTile"]').filter({ hasText: 'Inception' });
        await movieTile.click();

        // Verify discussion drawer is open
        const drawer = page.locator('div[class*="drawer"]');
        await expect(drawer).toBeVisible();
        await expect(drawer.getByText('Inception')).toBeVisible();

        // 5. Post a comment
        const commentText = `E2E Test Comment ${Date.now()}`;
        await drawer.getByPlaceholder(/Type a message/i).fill(commentText);
        await drawer.locator('button[class*="sendButton"]').click();

        // Verify comment appears
        await expect(drawer.getByText(commentText)).toBeVisible();

        // 6. Test closing with Escape key
        await page.keyboard.press('Escape');
        await expect(drawer).not.toBeVisible();

        // 7. Verify opening again from Discover feed
        await page.goto('/');
        await page.getByRole('button', { name: /^Discover$/i }).click();

        const discoverCard = page.locator('div[class*="movieCard"]').filter({ hasText: 'Inception' }).first();
        await expect(discoverCard).toBeVisible({ timeout: 10000 });

        // Click the card to open discussion
        await discoverCard.click();
        await expect(drawer).toBeVisible();
        await expect(drawer.getByText(commentText)).toBeVisible();

        // Close with Escape again
        await page.keyboard.press('Escape');
        await expect(drawer).not.toBeVisible();
    });
});
