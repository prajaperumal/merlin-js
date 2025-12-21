import { test as base, expect, type Page } from '@playwright/test';

type MyFixtures = {
    authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
    authenticatedPage: async ({ page }, use) => {
        // Perform test-only login
        const testId = Math.random().toString(36).substring(7);
        const email = `test-${testId}@example.com`;

        await page.goto('/');
        await page.evaluate(async (email) => {
            const res = await fetch('/api/auth/test-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    name: 'Test User'
                })
            });
            if (!res.ok) throw new Error(`Test login failed: ${res.status}`);
        }, email);

        // Wait for a bit for cookie to settle and then navigate
        await page.waitForTimeout(100);
        await page.goto('/');

        // Debug: log current URL and content
        // console.log('Current URL:', page.url());

        // The app might be slow to load "user", so we wait for either authenticated UI or "Welcome" (to fail fast)
        const locator = page.getByText(/All Circles/i).or(page.getByText(/No movies yet/i)).or(page.getByText(/Discovering movies/i));
        try {
            await expect(locator).toBeVisible({ timeout: 15000 });
        } catch (e) {
            await page.screenshot({ path: 'test-results/auth-failure.png' });
            const content = await page.content();
            console.log('Page content on auth failure:', content.substring(0, 1000));
            if (content.includes('Welcome to Merlin')) {
                throw new Error('Still on login page after test-login');
            }
            throw e;
        }

        await use(page);
    },
});

export { expect };
