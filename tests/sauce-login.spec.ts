import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const USERNAME = process.env.LOGIN_EMAIL || 'standard_user';
const PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

test.describe('Sauce Demo - Login flow functional test cases', () => {

  test('FC-1 Successful login with valid standard user credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('main', { name: '' }).getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('FC-2 Login fails with incorrect password for valid username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByLabel('Password').fill('wrong_password_123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login fails with non-existent username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('no_such_user');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Locked out user is blocked from logging in', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('locked_out_user');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-5 Locked out user blocked regardless of password correctness', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill('locked_out_user');
    await page.getByLabel('Password').fill('any_arbitrary_password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-6 Validation error when both username and password are empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Validation error when username is empty but password is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-8 Validation error when password is empty but username is filled', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-9: cannot be induced - no provided test account represents a near-threshold failed-attempt
  // state, and lockout appears to be a static pre-locked account rather than a live counter.
  test.skip('FC-9 Successful login resets failed attempt counter just below lockout threshold', async () => {});

  // FC-10: requires waiting out a real lockout timeout, and locked_out_user appears permanently
  // locked rather than time-limited in this environment, so this cannot be induced or verified.
  test.skip('FC-10 Locked-out user can log in again after lockout period expires', async () => {});

  test('FC-11 Login succeeds with leading/trailing whitespace in username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(`  ${USERNAME}  `);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('FC-12 Login succeeds with mismatched case in username', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(USERNAME.toUpperCase());
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('FC-13 Already logged-in user is not redirected away from login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);

    await page.goto(`${BASE_URL}/`);

    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByLabel('Username')).toBeVisible();
  });
});
