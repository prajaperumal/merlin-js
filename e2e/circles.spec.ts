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

    test('should invite a member from the Home page', async ({ authenticatedPage: page }) => {
        test.setTimeout(60000); // Increase timeout for this test
        await page.goto('/circles');
        const circleName = `Invite Circle ${Date.now()}`;
        await page.getByRole('button', { name: /Create.*Circle/i }).click();
        await page.getByPlaceholder(/Circle name/i).fill(circleName);
        await page.getByRole('button', { name: /^Create$/i }).click();

        await page.goto('/');
        await page.getByRole('button', { name: circleName }).click();

        const membersPanel = page.locator('div[class*="membersPanel"]');
        await expect(membersPanel).toBeVisible({ timeout: 20000 });

        try {
            const addMemberBtn = membersPanel.locator('button[class*="addMemberButton"]');
            await expect(addMemberBtn).toBeVisible();
            await addMemberBtn.click({ force: true });

            const modal = page.locator('div[class*="modal"]');
            await expect(modal.getByText(/Invite Member/i)).toBeVisible({ timeout: 10000 });

            await modal.getByPlaceholder(/Email address/i).fill('friend@example.com');
            await modal.getByRole('button', { name: /Send Invitation/i }).click({ force: true });

            await expect(modal).not.toBeVisible({ timeout: 10000 });
        } catch (e) {
            await page.screenshot({ path: `test-results/circles-fail-${Date.now()}.png`, fullPage: true });
            throw e;
        }
    });
});
