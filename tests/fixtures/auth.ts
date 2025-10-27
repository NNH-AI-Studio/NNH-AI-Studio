import { test as base, Page } from '@playwright/test';
import { AuthHelper } from './helpers';

export type AuthFixtures = {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    name: string;
  };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const fallbackEmail = `e2e.${Date.now()}.${Math.floor(Math.random()*10000)}@example.com`;
    const testUser = {
      email: process.env.TEST_USER_EMAIL || fallbackEmail,
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      name: process.env.TEST_USER_NAME || 'Test User',
    };
    await use(testUser);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    const auth = new AuthHelper(page);

    // Try login first
    await auth.login(testUser.email, testUser.password);
    try {
      await page.waitForURL('/dashboard', { timeout: 8000 });
    } catch {
      // If login failed (user may not exist), register then login
      await auth.register(testUser.email, testUser.password, testUser.name);
      await page.waitForTimeout(1500);
      await auth.login(testUser.email, testUser.password);
      await page.waitForURL('/dashboard', { timeout: 12000 });
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
