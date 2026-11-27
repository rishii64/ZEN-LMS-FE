import { test, expect } from '@playwright/test';

test.describe('Enterprise Multi-Tenant LMS E2E', () => {
  test('Super Admin and Tenant Admin login & dashboard flow', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.getByText('AstraLearn Enterprise LMS')).toBeVisible();

    await page.getByRole('button', { name: 'Acme Corp Admin' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Acme Global Corp Workspace')).toBeVisible();
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
