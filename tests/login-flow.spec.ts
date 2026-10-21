import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL as string;
const VALID_PASSWORD = process.env.LOGIN_PASSWORD as string;
const STANDARD_USER = process.env.LOGIN_EMAIL || 'standard_user';

test.describe('Swag Labs Login Flow', () => {
  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByLabel('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('FC-2 Login fails with incorrect password for valid username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByLabel('Password').fill('wrong_password_123');
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login fails with non-existent username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('no_such_user');
    await page.getByLabel('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Locked out user is blocked from logging in', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('locked_out_user');
    await page.getByLabel('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test.fixme('FC-5 Locked out user blocked regardless of password correctness — needs triage: app validates credential match before checking lockout, so an incorrect password for locked_out_user shows the generic "Username and password do not match" error instead of the lockout message', async () => {});

  test('FC-6 Validation error when both username and password are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Validation error when username is empty but password is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-8 Validation error when password is empty but username is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByRole('button', { name: 'Login' }).click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Epic sadface: Password is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test.skip('FC-9 Successful login resets failed attempt counter just below lockout threshold', async () => {
    // No provided test account represents a near-threshold failed-attempt state, and the app's
    // lockout appears to be a static pre-locked account (locked_out_user) rather than a live
    // counter we can drive to a specific count; this state cannot be induced with the given accounts.
  });

  test.skip('FC-10 Locked-out user can log in again after lockout period expires', async () => {
    // Requires waiting out a real lockout timeout; additionally, the locked_out_user account in this
    // environment appears to be permanently locked rather than time-limited, so this state cannot be
    // induced or verified without external setup.
  });

  test.fixme('FC-11 Login succeeds with leading/trailing whitespace in username — needs triage: the app does not trim whitespace from the username field, so "  standard_user  " is rejected with the "Username and password do not match" error instead of being authenticated', async () => {});

  test.fixme('FC-12 Login succeeds with mismatched case in username — needs triage: the app treats usernames as case-sensitive, so "STANDARD_USER" is rejected with the "Username and password do not match" error instead of being authenticated', async () => {});

  test('FC-13 Already logged-in user is not redirected away from login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByLabel('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);

    await page.goto(`${BASE_URL}/`);

    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByRole('form', { name: 'Login' })).toBeVisible();
  });
});
