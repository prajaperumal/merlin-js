import { test, expect } from './fixtures';

test.describe('Navigation and Search', () => {
    test('should switch modes and search for a movie', async ({ authenticatedPage: page }) => {
        // Should start in Discover mode
        const discoverBtn = page.getByRole('button', { name: /Discover/i });
        const watchstreamsBtn = page.getByRole('button', { name: /Watchstreams/i }).first();

        await expect(discoverBtn).toHaveClass(/modeTabActive/);

        // Switch to Watchstreams
        await watchstreamsBtn.click();
        await expect(watchstreamsBtn).toHaveClass(/modeTabActive/);

        // Search for a movie (Header search bar - uses MovieSearchBar)
        const searchInput = page.getByPlaceholder(/Search for movies/i);
        await searchInput.fill('The Dark Knight');

        // Verify results in dropdown (MovieSearchBar uses movieResult class)
        const movieResult = page.locator('[class*="movieResult"]').first();
        await expect(movieResult).toBeVisible({ timeout: 10000 });
        await expect(movieResult.getByText(/The Dark Knight/i)).toBeVisible();

        // Switch back to Discover
        await discoverBtn.click();
        await expect(discoverBtn).toHaveClass(/modeTabActive/);
    });
});
