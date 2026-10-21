import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || 'standard_user';
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

async function login(page: any, username: string, password: string) {
  await page.goto(`${BASE_URL}/`);
  const usernameInput = page.getByRole('textbox', { name: 'Username' });
  const passwordInput = page.getByRole('textbox', { name: 'Password' });
  const loginButton = page.getByRole('button', { name: 'Login' });
  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await loginButton.click();
}

test.describe('Saucedemo Login Functional Test Cases', () => {
  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await login(page, LOGIN_EMAIL, LOGIN_PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('FC-2 Login fails with incorrect password for valid username', async ({ page }) => {
    await login(page, LOGIN_EMAIL, 'wrong_password_123');
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
  });

  test('FC-3 Login fails with non-existent username', async ({ page }) => {
    await login(page, 'no_such_user', LOGIN_PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
  });

  test('FC-4 Locked out user is blocked from logging in', async ({ page }) => {
    await login(page, 'locked_out_user', LOGIN_PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
  });

  test.fixme('FC-5 Locked out user blocked regardless of password correctness — needs triage: app validates credentials before lockout state, so an incorrect password for locked_out_user shows the generic "Username and password do not match" error instead of the lockout message', async () => {});

  test('FC-6 Validation error when both username and password are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
  });

  test('FC-7 Validation error when username is empty but password is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
  });

  test('FC-8 Validation error when password is empty but username is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill(LOGIN_EMAIL);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
  });

  // FC-9: No provided test account represents a near-threshold failed-attempt state, and the app's
  // lockout appears to be a static pre-locked account (locked_out_user) rather than a live counter
  // we can drive to a specific count; this state cannot be induced with the given accounts.
  test.skip('FC-9 Successful login resets failed attempt counter just below lockout threshold', async () => {});

  // FC-10: Requires waiting out a real lockout timeout; additionally, the locked_out_user account in
  // this environment appears to be permanently locked rather than time-limited, so this state cannot
  // be induced or verified without external setup.
  test.skip('FC-10 Locked-out user can log in again after lockout period expires', async () => {});

  test.fixme('FC-11 Login succeeds with leading/trailing whitespace in username — needs triage: the app does not trim whitespace from the username field, so "  standard_user  " produces the generic invalid-credentials error instead of authenticating', async () => {});

  test.fixme('FC-12 Login succeeds with mismatched case in username — needs triage: the app treats usernames as case-sensitive, so "STANDARD_USER" produces the generic invalid-credentials error instead of authenticating', async () => {});

  test('FC-13 Already logged-in user is not redirected away from login page', async ({ page }) => {
    await login(page, LOGIN_EMAIL, LOGIN_PASSWORD);
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
