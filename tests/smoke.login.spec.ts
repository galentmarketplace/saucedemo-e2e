import { test, expect } from '@playwright/test';

/**
 * Baseline smoke test, hand-written so this suite is green and meaningful before any
 * agent-authored spec lands. It is the check branch protection requires, so if it ever
 * goes red the pipeline stops rather than merging on an empty suite.
 */
const USER = process.env.LOGIN_EMAIL || 'standard_user';
const PASS = process.env.LOGIN_PASSWORD || 'secret_sauce';

test('a valid user can log in and reach the inventory', async ({ page }) => {
  await page.goto(process.env.LOGIN_PATH || '/');
  await page.getByPlaceholder('Username').fill(USER);
  await page.getByPlaceholder('Password').fill(PASS);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('[data-test="inventory-item"]').first()).toBeVisible();
});

test('invalid credentials are rejected with an error', async ({ page }) => {
  await page.goto(process.env.LOGIN_PATH || '/');
  await page.getByPlaceholder('Username').fill(USER);
  await page.getByPlaceholder('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('[data-test="error"]')).toContainText(/do not match/i);
  await expect(page).not.toHaveURL(/inventory/);
});
