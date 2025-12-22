import { test, expect } from './fixtures';

test.describe('Full Discovery Flow', () => {
    test('should create circles, add movies, and recommend between them (New layout)', async ({ authenticatedPage: page }) => {
        test.setTimeout(180000);
        page.on('dialog', dialog => {
            console.log(`ALERT: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });

        const circle1 = `Flow Circle A ${Date.now()}`;
        const circle2 = `Flow Circle B ${Date.now()}`;

        // 1. Create circles
        for (const name of [circle1, circle2]) {
            await page.goto('/circles');
            await page.getByRole('button', { name: /Create.*Circle/i }).click();
            await page.getByPlaceholder(/Circle name/i).fill(name);
            await page.getByRole('button', { name: /^Create$/i }).click();
            await expect(page.locator('main').getByText(name)).toBeVisible({ timeout: 20000 });
        }

        try {
            // 2. Add movie to Circle A
            await page.goto('/circles');
            await page.getByRole('link', { name: circle1 }).click();
            await page.getByRole('button', { name: /Actions/i }).click();
            await page.getByRole('button', { name: /Add Movie/i }).click();

            const searchModal = page.locator('div[class*="modal"]');
            await searchModal.getByPlaceholder(/Search for movies/i).fill('Inception');

            const addButton = searchModal.locator('button[class*="addButton"]').first();
            await expect(addButton).toBeVisible({ timeout: 20000 });
            await addButton.click({ force: true });

            await page.getByPlaceholder(/Share why you think/i).fill('Top tier sci-fi');
            await page.getByRole('button', { name: /Add to Circle/i }).click({ force: true });
            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 20000 });

            // 3. Verify in Home feed and recommend to Circle B
            await page.goto('/');
            await expect(page.getByText(/Discovering movies/i)).not.toBeVisible({ timeout: 40000 });

            const inceptionCard = page.locator('main').locator('div[class*="movieCard"]').filter({ hasText: 'Inception' });
            await expect(inceptionCard).toBeVisible({ timeout: 30000 });

            await inceptionCard.hover();
            await inceptionCard.getByTitle('Recommend to Circles').click({ force: true });

            const recommendModal = page.locator('div[class*="modal"]');
            await expect(recommendModal).toBeVisible({ timeout: 15000 });

            // Select Circle B
            const circleTarget = recommendModal.locator('div[class*="circleOption"]').filter({ hasText: circle2 });
            await expect(circleTarget).toBeVisible({ timeout: 10000 });

            await circleTarget.click({ force: true });
            await expect(circleTarget).toHaveClass(/circleOptionSelected/, { timeout: 10000 });

            const confirmRecommendBtn = recommendModal.locator('button').filter({ hasText: /Recommend/i }).first();
            await expect(confirmRecommendBtn).toBeEnabled({ timeout: 10000 });

            // Wait for response
            const recommendPromise = page.waitForResponse(resp =>
                resp.url().includes('/movies') &&
                resp.request().method() === 'POST' &&
                resp.status() === 201,
                { timeout: 30000 }
            );
            await confirmRecommendBtn.click({ force: true });
            await recommendPromise;

            // 4. Verification in Circle B detail
            await page.goto('/circles');
            const circleLink = page.locator('a').filter({ hasText: circle2 });
            await expect(circleLink).toBeVisible({ timeout: 15000 });
            await circleLink.click({ force: true });

            // Final check on detail page
            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 30000 });
        } catch (e) {
            await page.screenshot({ path: `test-results/flow-fail-${Date.now()}.png`, fullPage: true });
            throw e;
        }
    });
});
