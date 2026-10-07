import { test, expect } from './fixtures';

const BASE_URL = process.env.BASE_URL!;
const VALID_PASSWORD = process.env.LOGIN_PASSWORD || 'secret_sauce';

async function goToLogin(page: import('./fixtures').Page) {
  await page.goto(`${BASE_URL}/`);
}

async function fillLoginForm(
  page: import('./fixtures').Page,
  username: string,
  password: string
) {
  const usernameInput = page.getByPlaceholder('Username');
  const passwordInput = page.getByPlaceholder('Password');
  if (username.length > 0) {
    await usernameInput.fill(username);
  }
  if (password.length > 0) {
    await passwordInput.fill(password);
  }
}

async function submitLogin(page: import('./fixtures').Page) {
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('SauceDemo Login Functional Test Cases', () => {
  test('FC-1 Valid credentials redirect to dashboard and create session', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'standard_user', VALID_PASSWORD);
    await submitLogin(page);

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(
      page.getByRole('button', { name: 'View details for Sauce Labs Backpack' })
    ).toBeVisible();
  });

  test('FC-2 Login with correct username but incorrect password shows invalid credentials error', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'standard_user', 'wrong_password');
    await submitLogin(page);

    await expect(
      page.getByText('Epic sadsface: Username and password do not match any user in this service')
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-3 Login with non-existent username shows invalid credentials error', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'no_such_user', VALID_PASSWORD);
    await submitLogin(page);

    await expect(
      page.getByText('Epic sadsface: Username and password do not match any user in this service')
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-4 Login attempt on pre-locked account shows lockout message and prevents login', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'locked_out_user', VALID_PASSWORD);
    await submitLogin(page);

    await expect(
      page.getByText('Epic sadsface: Sorry, this user has been locked out.')
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-5 Submitting login form with both username and password empty shows required-field validation error', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, '', '');
    await submitLogin(page);

    await expect(page.getByText('Epic sadsface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-6 Submitting login form with empty username only shows required-field validation error', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, '', VALID_PASSWORD);
    await submitLogin(page);

    await expect(page.getByText('Epic sadsface: Username is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test('FC-7 Submitting login form with empty password only shows required-field validation error', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'standard_user', '');
    await submitLogin(page);

    await expect(page.getByText('Epic sadsface: Password is required')).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  // FC-8: No disposable/unlocked test account is available to safely drive into a freshly-locked
  // state without permanently locking a shared credential (standard_user, problem_user,
  // performance_glitch_user) needed by other tests; locked_out_user is already pre-locked so the
  // transition into lockout cannot be observed. Requires external account provisioning/reset not
  // available in this environment.
  test.skip('FC-8 Reaching max failed login attempts locks the account immediately with lockout message', async () => {});

  test('FC-9 Login with mismatched-case username logs in successfully (case-insensitive)', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'Standard_User', VALID_PASSWORD);
    await submitLogin(page);

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    await expect(
      page.getByRole('button', { name: 'View details for Sauce Labs Backpack' })
    ).toBeVisible();
  });

  test('FC-10 Valid login with slow-responding account still redirects to dashboard and creates session', async ({ page }) => {
    await goToLogin(page);
    await fillLoginForm(page, 'performance_glitch_user', VALID_PASSWORD);
    await submitLogin(page);

    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`, { timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'View details for Sauce Labs Backpack' })
    ).toBeVisible({ timeout: 15000 });
  });
});
