import { Page, expect, Locator } from '@playwright/test';

/** Base page object: shared navigation + interaction helpers all pages reuse. */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') { await this.page.goto(path); }
  async expectPath(path: string | RegExp) { await expect(this.page).toHaveURL(path); }
  async clickButton(name: string | RegExp) { await this.page.getByRole('button', { name }).click(); }
  async fillByLabel(label: string | RegExp, value: string) { await this.page.getByLabel(label).fill(value); }
  async fillByPlaceholder(ph: string | RegExp, value: string) { await this.page.getByPlaceholder(ph).fill(value); }
  async expectVisible(locator: Locator) { await expect(locator).toBeVisible(); }
}
