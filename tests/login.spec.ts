import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL!;
const VALID_PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

test.describe('Sauce Labs Login flow', () => {
  test('FC-1 Valid credentials redirect to dashboard and create session', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('FC-2 Login with correct username but incorrect password shows invalid credentials error', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Username and password do not match any user in this service/i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login with non-existent username shows invalid credentials error', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('no_such_user');
    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Username and password do not match any user in this service/i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Login attempt on pre-locked account shows lockout message and prevents login', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('locked_out_user');
    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Sorry, this user has been locked out\./i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-5 Submitting login form with both username and password empty shows required-field validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Username is required/i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-6 Submitting login form with empty username only shows required-field validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Username is required/i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Submitting login form with empty password only shows required-field validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Epic sadface: Password is required/i)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-8: No disposable/unlocked test account is available to safely drive into a freshly-locked
  // state without permanently locking a shared credential (standard_user, problem_user,
  // performance_glitch_user) needed by other tests; locked_out_user is already pre-locked so the
  // transition into lockout cannot be observed. Requires external account provisioning/reset not
  // available in this environment.
  test.skip('FC-8 Reaching max failed login attempts locks the account immediately with lockout message', async () => {});

  test('FC-9 Login with mismatched-case username logs in successfully (case-insensitive)', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('Standard_User');
    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  });

  test('FC-10 Valid login with slow-responding account still redirects to dashboard and creates session', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('textbox', { name: 'Username' }).fill('performance_glitch_user');
    await page.getByRole('textbox', { name: 'Password' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`, { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible({ timeout: 15000 });
  });
});
