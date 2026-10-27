import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const USERNAME = process.env.LOGIN_EMAIL || 'standard_user';
const PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

async function login(page: any, username: string, password: string) {
  await page.goto(`${BASE_URL}/`);
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('SauceDemo Login', () => {
  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await login(page, USERNAME, PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('FC-2 Login fails with correct username and incorrect password', async ({ page }) => {
    await login(page, USERNAME, 'totally_wrong_password');
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login fails with incorrect username and any password', async ({ page }) => {
    await login(page, 'invalid_user', 'any_password');
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Login fails with both incorrect username and password', async ({ page }) => {
    await login(page, 'wrong_user', 'wrong_pass');
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-5 Locked out user cannot log in and sees lockout message', async ({ page }) => {
    await login(page, 'locked_out_user', PASSWORD);
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test.fixme('FC-6 Locked out user cannot log in even with incorrect credentials — needs triage: app shows generic "Username and password do not match" error instead of the lockout message when locked_out_user is combined with an incorrect password, so the expected lockout-specific message is never shown', async () => {});

  test('FC-7 Submit login form with both username and password empty', async ({ page }) => {
    await login(page, '', '');
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-8 Submit login form with username empty and password filled', async ({ page }) => {
    await login(page, '', PASSWORD);
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-9 Submit login form with password empty and username filled', async ({ page }) => {
    await login(page, USERNAME, '');
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toContainText('Epic sadface: Password is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-10: not automatable — lockout threshold/failed-attempt counter is not exposed/controllable via
  // provided test accounts, and using standard_user risks permanently locking it; no 'almost locked' account exists.
  test.skip('FC-10 Successful login after failed attempts below lockout threshold resets counter', async () => {});

  // FC-11: not automatable — locked_out_user is a permanently pre-locked account with no documented/controllable
  // expiry period, so waiting out a real timeout is not feasible in automated end-to-end testing.
  test.skip('FC-11 Locked-out user can log in again after lockout period expires', async () => {});

  test.fixme('FC-12 Login succeeds when credentials contain leading/trailing whitespace — needs triage: the app does not trim whitespace from the username/password fields, so credentials with leading/trailing spaces are rejected with an invalid-credentials error instead of being trimmed and accepted', async () => {});

  test('FC-13 Successful login with performance_glitch_user despite slow response', async ({ page }) => {
    await login(page, 'performance_glitch_user', PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`, { timeout: 15000 });
    await expect(page.getByRole('main')).toBeVisible({ timeout: 15000 });
  });

  test('FC-14 Successful login with problem_user account', async ({ page }) => {
    await login(page, 'problem_user', PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
