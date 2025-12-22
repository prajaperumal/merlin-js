import { test, expect } from './fixtures';

test.describe('Watchstream Management', () => {
    test('should create and verify a watchstream in Home filters', async ({ authenticatedPage: page }) => {
        await page.goto('/watchstreams');
        const wsName = `Home WS Filter ${Date.now()}`;
        await page.getByRole('button', { name: /Create Watchstream/i }).click();
        await page.getByPlaceholder(/Watchstream name/i).fill(wsName);
        await page.getByRole('button', { name: /^Create$/i }).click();
        await expect(page.locator('main').getByText(wsName)).toBeVisible();

        await page.goto('/');
        await page.getByRole('button', { name: /Watchstreams/i }).click();

        const filterBtn = page.locator('div[class*="filters"]').getByRole('button', { name: wsName });
        await expect(filterBtn).toBeVisible({ timeout: 10000 });
    });

    test('should move movie from backlog to watched', async ({ authenticatedPage: page }) => {
        page.on('dialog', dialog => {
            console.log(`ALERT: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });

        await page.goto('/watchstreams');
        const wsName = `Status Test ${Date.now()}`;
        await page.getByRole('button', { name: /Create Watchstream/i }).click();
        await page.getByPlaceholder(/Watchstream name/i).fill(wsName);
        await page.getByRole('button', { name: /^Create$/i }).click();

        await page.goto('/');
        await page.getByRole('button', { name: /Watchstreams/i }).click();
        await page.getByRole('button', { name: wsName }).click();

        await page.getByRole('button', { name: /Add Movie/i }).click();
        const searchModal = page.locator('div[class*="modal"]');
        await searchModal.getByPlaceholder(/Search for movies/i).fill('Inception');

        try {
            const addButton = searchModal.locator('button[class*="addButton"]').first();
            await expect(addButton).toBeVisible({ timeout: 15000 });
            await addButton.click({ force: true });

            const confirmBtn = page.locator('button').filter({ hasText: /^Add Movie$/ }).last();
            await expect(confirmBtn).toBeVisible({ timeout: 15000 });
            await confirmBtn.click({ force: true });

            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 15000 });

            const inceptionCard = page.locator('div[class*="movieCard"]').filter({ hasText: 'Inception' });
            await inceptionCard.hover();

            // Wait for marking
            await inceptionCard.getByRole('button', { name: /Mark Watched/i }).click({ force: true });

            // Wait for state to settle
            await page.waitForTimeout(1000);

            const watchedTab = page.locator('button[class*="viewTab"]').filter({ hasText: /Watched/ });
            await expect(watchedTab).toBeVisible({ timeout: 10000 });
            await watchedTab.click({ force: true });

            await expect(page.locator('main').getByText('Inception')).toBeVisible({ timeout: 15000 });
        } catch (e) {
            await page.screenshot({ path: `test-results/ws-fail-${Date.now()}.png`, fullPage: true });
            throw e;
        }
    });
});
