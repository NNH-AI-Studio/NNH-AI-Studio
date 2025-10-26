import { test, expect } from '@playwright/test';
import { generateUniqueEmail } from '../fixtures/data';
import { AuthHelper, NavigationHelper, waitForLoadingToComplete } from '../fixtures/helpers';

test.describe('Authentication Flow', () => {
  let authHelper: AuthHelper;
  let navHelper: NavigationHelper;
  let testEmail: string;
  const testPassword = 'TestPassword123!';
  const testName = 'E2E Test User';

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navHelper = new NavigationHelper(page);
    testEmail = generateUniqueEmail('e2e-auth');
  });

  test('should display home page with sign in and get started buttons', async ({ page }) => {
    await navHelper.goToHome();

    await expect(page.getByText(/NNH Local/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    await authHelper.register(testEmail, testPassword, testName);

    await page.waitForURL(/\/dashboard|\/login/, { timeout: 15000 });

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/dashboard|\/login/);
  });

  test('should show error for registration with existing email', async ({ page }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.register(testEmail, testPassword, testName);

    await expect(page.locator('text=/already exists|already registered/i')).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.login(testEmail, testPassword);

    await page.waitForURL('/dashboard', { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should show error for login with invalid credentials', async ({ page }) => {
    await authHelper.login('nonexistent@example.com', 'wrongpassword');

    await expect(page.locator('text=/invalid|incorrect|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.login(testEmail, testPassword);
    await page.waitForURL('/dashboard', { timeout: 15000 });

    await navHelper.goToLogin();

    expect(page.url()).toContain('/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.login(testEmail, testPassword);
    await page.waitForURL('/dashboard', { timeout: 15000 });

    await waitForLoadingToComplete(page);

    const userMenuButton = page.locator('button:has-text("Sign Out"), button[aria-label*="user" i], [role="button"]:has-text("Sign Out")').first();

    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
    }

    const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")').first();
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }

    await page.waitForURL(/\/|\/login/, { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/$|\/login$/);
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    await navHelper.goToDashboard();

    await page.waitForURL('/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', testPassword);

    await page.click('button[type="submit"]');

    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    expect(validationMessage).toBeTruthy();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', '123');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/password.*short|minimum|at least/i')).toBeVisible({ timeout: 5000 });
  });

  test('should persist session after page refresh', async ({ page, context }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.login(testEmail, testPassword);
    await page.waitForURL('/dashboard', { timeout: 15000 });

    await page.reload();
    await waitForLoadingToComplete(page);

    expect(page.url()).toContain('/dashboard');
  });

  test('should handle session across multiple tabs', async ({ page, context }) => {
    await authHelper.register(testEmail, testPassword, testName);
    await page.waitForTimeout(2000);

    await authHelper.login(testEmail, testPassword);
    await page.waitForURL('/dashboard', { timeout: 15000 });

    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    await waitForLoadingToComplete(newPage);

    expect(newPage.url()).toContain('/dashboard');

    await newPage.close();
  });
});
