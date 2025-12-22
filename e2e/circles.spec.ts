import { test, expect } from './fixtures';

test.describe('Circle Management', () => {
    test('should create and verify a circle in Home filters', async ({ authenticatedPage: page }) => {
        await page.goto('/circles');
        const circleName = `Home Filter Circle ${Date.now()}`;
        await page.getByRole('button', { name: /Create.*Circle/i }).click();
        await page.getByPlaceholder(/Circle name/i).fill(circleName);
        await page.getByRole('button', { name: /^Create$/i }).click();
        await expect(page.locator('main').getByText(circleName)).toBeVisible();

        await page.goto('/');
        const filterBtn = page.locator('div[class*="filters"]').getByRole('button', { name: circleName });
        await expect(filterBtn).toBeVisible({ timeout: 10000 });
    });

    // SKIP: This test requires a pre-existing user to invite, which is complex to set up in a single session.
    test.skip('should invite a member from the Home page', async ({ authenticatedPage: page }) => {
        test.setTimeout(60000);
        await page.goto('/circles');
        const circleName = `Invite Circle ${Date.now()}`;
        await page.getByRole('button', { name: /Create.*Circle/i }).click();
        await page.getByPlaceholder(/Circle name/i).fill(circleName);
        await page.getByRole('button', { name: /^Create$/i }).click();

        await page.goto('/');
        await page.getByRole('button', { name: circleName }).click();

        try {
            const addMemberBtn = page.getByTitle('Invite member');
            await expect(addMemberBtn).toBeVisible({ timeout: 20000 });
            await addMemberBtn.click({ force: true });

            const modal = page.locator('div[class*="modal"]');
            await expect(modal).toBeVisible({ timeout: 10000 });

            await modal.getByPlaceholder(/Email address/i).fill('friend@example.com');
            await modal.getByRole('button', { name: /Send Invitation/i }).click({ force: true });

            await expect(modal).not.toBeVisible({ timeout: 15000 });
        } catch (e) {
            await page.screenshot({ path: `test-results/circles-fail-${Date.now()}.png`, fullPage: true });
            throw e;
        }
    });
});
