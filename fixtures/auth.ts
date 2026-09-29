import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/** Extends `test` with a `loggedInPage` fixture using env credentials. */
export const test = base.extend<{ loggedInPage: import('@playwright/test').Page }>({
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.login(process.env.LOGIN_EMAIL || '', process.env.LOGIN_PASSWORD || '');
    await use(page);
  },
});
export { expect } from '@playwright/test';
