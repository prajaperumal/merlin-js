import { test, expect } from '@playwright/test';

test('has welcome message', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to Merlin/i)).toBeVisible();
});

test('shows login button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
});
