import { test, expect } from './fixtures';

test.describe('Full Discovery Flow', () => {
    test('should create circles, add movies, and recommend between them (New layout)', async ({ authenticatedPage: page }) => {
        test.setTimeout(90000); // Higher timeout for the full flow
        const circle1 = `Flow Circle A ${Date.now()}`;
        const circle2 = `Flow Circle B ${Date.now()}`;

        for (const name of [circle1, circle2]) {
            await page.goto('/circles');
            await page.getByRole('button', { name: /Create.*Circle/i }).click();
            await page.getByPlaceholder(/Circle name/i).fill(name);
            await page.getByRole('button', { name: /^Create$/i }).click();
        }

        try {
            await page.goto('/circles');
            await page.getByRole('link', { name: circle1 }).click();
            await page.getByRole('button', { name: /Actions/i }).click();
            await page.getByRole('button', { name: /Add Movie/i }).click();

            const searchModal = page.locator('div[class*="modal"]');
            await searchModal.getByPlaceholder(/Search for movies/i).fill('Inception');

            const addButton = searchModal.locator('button[class*="addButton"]').first();
            await expect(addButton).toBeVisible({ timeout: 15000 });
            await addButton.click({ force: true });

            await page.getByPlaceholder(/Share why you think/i).fill('Top tier sci-fi');
            await page.getByRole('button', { name: /Add to Circle/i }).click({ force: true });
            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 15000 });

            await page.goto('/');
            await expect(page.getByText(/Discovering movies/i)).not.toBeVisible({ timeout: 20000 });

            const inceptionCard = page.locator('main').locator('div[class*="movieCard"]').filter({ hasText: 'Inception' });
            await expect(inceptionCard).toBeVisible({ timeout: 15000 });

            await inceptionCard.hover();
            await inceptionCard.locator('button[title="Recommend to Circles"]').click({ force: true });

            const recommendModal = page.locator('div[class*="modal"]');
            await expect(recommendModal).toBeVisible({ timeout: 10000 });
            await recommendModal.getByText(circle2).click({ force: true });

            const confirmRecommendBtn = recommendModal.locator('button').filter({ hasText: /^Recommend$/ }).first();
            await confirmRecommendBtn.click({ force: true });

            await page.goto('/circles');
            await page.getByRole('link', { name: circle2 }).click();
            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 15000 });
        } catch (e) {
            await page.screenshot({ path: `test-results/flow-fail-${Date.now()}.png`, fullPage: true });
            throw e;
        }
    });
});
