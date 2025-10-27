import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async goToLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async goToRegister() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async goToAccounts() {
    await this.page.goto('/settings/integrations');
    await this.page.waitForLoadState('networkidle');
    // Fallback to legacy route if needed
    if (!this.page.url().includes('/settings/integrations')) {
      await this.page.goto('/accounts');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async goToLocations() {
    await this.page.goto('/locations');
    await this.page.waitForLoadState('networkidle');
  }

  async goToPosts() {
    await this.page.goto('/posts');
    await this.page.waitForLoadState('networkidle');
  }

  async goToReviews() {
    await this.page.goto('/reviews');
    await this.page.waitForLoadState('networkidle');
  }

  async goToInsights() {
    await this.page.goto('/insights');
    await this.page.waitForLoadState('networkidle');
  }

  async goToGMBStudio() {
    await this.page.goto('/gmb-studio');
    await this.page.waitForLoadState('networkidle');
  }

  async goToAISettings() {
    await this.page.goto('/ai-settings');
    await this.page.waitForLoadState('networkidle');
  }
}

export class AuthHelper {
  constructor(private page: Page) {}

  async register(email: string, password: string, fullName?: string) {
    await this.page.goto('/register');

    if (fullName) {
      const nameInput = this.page.locator('input[name="fullName"], input[placeholder*="name" i]').first();
      await nameInput.fill(fullName);
    }

    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);

    const confirmPasswordInput = this.page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]').first();
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(password);
    }

    // Agree to terms if required
    const terms = this.page.locator('#terms');
    if (await terms.count()) {
      try {
        await terms.check();
      } catch {
        await terms.click();
      }
    }

    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async logout() {
    const logoutButton = this.page.getByRole('button', { name: /sign out|logout/i });
    await logoutButton.click();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 5000 });
      return this.page.url().includes('/dashboard');
    } catch {
      return false;
    }
  }
}

export class FormHelper {
  constructor(private page: Page) {}

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async clickButton(text: string) {
    await this.page.getByRole('button', { name: new RegExp(text, 'i') }).click();
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
  }

  async waitForSuccessMessage(timeout = 5000) {
    await this.page.waitForSelector('[role="alert"], .toast, .notification', { timeout });
  }

  async waitForErrorMessage(timeout = 5000) {
    await this.page.waitForSelector('[role="alert"][class*="error"], .toast-error, .error-notification', { timeout });
  }
}

export class ModalHelper {
  constructor(private page: Page) {}

  async openModal(buttonText: string) {
    await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
    await this.page.waitForSelector('[role="dialog"], .modal', { state: 'visible' });
  }

  async closeModal() {
    const closeButton = this.page.locator('[role="dialog"] button[aria-label*="close" i], .modal button[aria-label*="close" i]').first();
    await closeButton.click();
    await this.page.waitForSelector('[role="dialog"], .modal', { state: 'hidden' });
  }

  async isModalOpen(): Promise<boolean> {
    return await this.page.locator('[role="dialog"], .modal').isVisible();
  }

  async getModalTitle(): Promise<string> {
    return await this.page.locator('[role="dialog"] h2, .modal h2').first().textContent() || '';
  }
}

export async function waitForLoadingToComplete(page: Page, timeout = 10000) {
  try {
    await page.waitForSelector('[class*="loading"], [class*="spinner"], [class*="loader"]', {
      state: 'hidden',
      timeout
    });
  } catch {
  }
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  const screenshotPath = `test-results/screenshots/${testName}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

export async function assertUrlContains(page: Page, urlPart: string) {
  await expect(page).toHaveURL(new RegExp(urlPart));
}

export async function assertElementVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

export async function assertElementNotVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible();
}

export async function assertTextContent(page: Page, selector: string, expectedText: string) {
  await expect(page.locator(selector)).toContainText(expectedText);
}
