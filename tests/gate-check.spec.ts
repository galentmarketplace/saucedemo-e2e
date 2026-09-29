import { test, expect } from '@playwright/test';

// Temporary: proves the CI gate actually blocks a red pull request. Removed immediately after.
test('deliberately failing assertion to verify the merge gate', async ({ page }) => {
  await page.goto(process.env.LOGIN_PATH || '/');
  await expect(page).toHaveTitle('THIS TITLE DOES NOT EXIST');
});
