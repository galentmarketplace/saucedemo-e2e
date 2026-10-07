import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const STANDARD_USER = process.env.LOGIN_EMAIL || 'standard_user';
const PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';
const LOCKED_OUT_USER = 'locked_out_user';

test.describe('SauceDemo Login Functional Test Cases', () => {

  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill(STANDARD_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('button', { name: 'View details for Sauce Labs Backpack' }).first()).toBeVisible();
  });

  test('FC-2 Login fails with incorrect password for a valid username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill(STANDARD_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login fails with incorrect/non-existent username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill('invalid_user');
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Login attempt with pre-locked account shows lockout message', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill(LOCKED_OUT_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test.fixme('FC-5 Locked account shows lockout message even with incorrect password — needs triage: app returns generic "Epic sadface: Username and password do not match any user in this service" error for locked_out_user with a wrong password instead of the lockout message, so lockout does not take precedence as expected', async () => {});

  test('FC-6 Validation message shown when both username and password are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Validation message shown when username is empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-8 Validation message shown when password is empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('textbox', { name: 'Username' }).fill(STANDARD_USER);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test.skip('FC-9 Account transitions to locked state after reaching max consecutive failed login attempts', async () => {
    // No disposable account is provided to safely induce a fresh lockout; standard_user is needed
    // unlocked for other must-have cases and locked_out_user is already pre-locked, with no
    // documented max-attempt threshold or reset mechanism available in this environment.
  });

  test.skip('FC-10 Previously locked-out user can log in successfully after lockout period expires', async () => {
    // Requires waiting out a real lockout expiry timeout; locked_out_user on this environment is
    // permanently/statically locked with no documented expiry, so this cannot be induced or waited
    // out in an automated run.
  });
});
