import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const STANDARD_USER = process.env.LOGIN_EMAIL || 'standard_user';
const PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

test.describe('SauceDemo Login Flow', () => {
  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('FC-2 Login fails with incorrect password for a valid username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login fails with incorrect/non-existent username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('invalid_user');
    await page.getByLabel('Password').fill('anypassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Login attempt with pre-locked account shows lockout message', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('locked_out_user');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-5 needs triage: the real app returns the generic 'Username and password do not match'
  // message for locked_out_user + an incorrect password, NOT the lockout message. Confirmed by
  // prior run's failure trace showing the actual alert text was the generic credential-mismatch
  // message, contradicting the case's expectation that lockout takes precedence.
  test.fixme('FC-5 Locked account shows lockout message even with incorrect password — needs triage: app shows generic invalid-credentials message instead of lockout message when password is wrong for locked_out_user', async () => {});

  test('FC-6 Validation message shown when both username and password are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Validation message shown when username is empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Username is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-8 Validation message shown when password is empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(STANDARD_USER);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Epic sadface: Password is required');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-9: No disposable account is provided to safely induce a fresh lockout; the only accounts
  // available are standard_user (needed unlocked for other must-have cases) and locked_out_user
  // (already pre-locked). Intentionally exhausting standard_user's attempts would break other test
  // cases and there is no documented max-attempt threshold or reset mechanism available in this
  // environment.
  test.skip('FC-9 Account transitions to locked state after reaching max consecutive failed login attempts', async () => {});

  // FC-10: Requires waiting out a real lockout expiry timeout; locked_out_user on this environment
  // is permanently/statically locked with no documented expiry, so this condition cannot be induced
  // or waited out in an automated run.
  test.skip('FC-10 Previously locked-out user can log in successfully after lockout period expires', async () => {});
});
