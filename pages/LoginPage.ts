import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Example page object — agents extend this pattern for new pages. */
export class LoginPage extends BasePage {
  constructor(page: Page) { super(page); }

  async login(email: string, password: string) {
    await this.goto(process.env.LOGIN_PATH || '/login');
    await this.fillByPlaceholder(/email|@/i, email).catch(async () => {
      await this.fillByLabel(/email/i, email);
    });
    await this.page.getByRole('textbox').nth(0).fill(email).catch(() => {});
    await this.clickButton(/log ?in|sign ?in/i);
  }
}
