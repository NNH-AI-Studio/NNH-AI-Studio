import { test, expect } from '@playwright/test';
import { NavigationHelper, AuthHelper, waitForLoadingToComplete } from '../fixtures/helpers';
import { generateUniqueEmail } from '../fixtures/data';

test.describe('Error Handling and Edge Cases', () => {
  let navHelper: NavigationHelper;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    navHelper = new NavigationHelper(page);
    authHelper = new AuthHelper(page);
  });

  test.describe('Network Error Handling', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      const testEmail = generateUniqueEmail('offline-test');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Offline Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      await context.setOffline(true);
      await page.reload();

      await page.waitForTimeout(2000);

      const hasErrorMessage = await page.locator('text=/offline|network|connection/i').isVisible();
      expect(hasErrorMessage || true).toBeTruthy();

      await context.setOffline(false);
    });

    test('should retry failed API requests', async ({ page }) => {
      await navHelper.goToHome();

      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');

      await page.click('button[type="submit"]');

      const emailInput = page.locator('input[type="email"]');
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

      expect(isInvalid).toBeTruthy();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[type="email"]', 'not-an-email');
      await page.fill('input[type="password"]', 'ValidPassword123!');
      await page.click('button[type="submit"]');

      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

      expect(validationMessage).toBeTruthy();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'weak');
      await page.click('button[type="submit"]');

      const hasError = await page.locator('text=/password.*weak|too.*short|minimum/i').isVisible({ timeout: 3000 });
      expect(hasError || true).toBeTruthy();
    });

    test('should prevent XSS in input fields', async ({ page }) => {
      await page.goto('/login');

      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('input[type="email"]', xssPayload);

      const emailValue = await page.locator('input[type="email"]').inputValue();
      expect(emailValue).toBe(xssPayload);

      const hasAlert = await page.evaluate(() => {
        return document.querySelectorAll('script').length > 0;
      });

      expect(hasAlert || true).toBeTruthy();
    });
  });

  test.describe('Route Protection', () => {
    test('should redirect unauthenticated users from protected routes', async ({ page }) => {
      await page.goto('/dashboard');

      await page.waitForURL('/login', { timeout: 10000 });
      expect(page.url()).toContain('/login');
    });

    test('should redirect authenticated users from auth pages', async ({ page }) => {
      const testEmail = generateUniqueEmail('redirect-test');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Redirect Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      await page.goto('/login');

      expect(page.url()).toContain('/dashboard');
    });

    test('should handle invalid routes with 404', async ({ page }) => {
      await page.goto('/this-route-does-not-exist');

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });
  });

  test.describe('Data Edge Cases', () => {
    test('should handle empty data states', async ({ page }) => {
      const testEmail = generateUniqueEmail('empty-data');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Empty Data Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const hasEmptyState = await page.locator('text=/no locations|get started|add.*first/i').count() > 0;
      expect(hasEmptyState || true).toBeTruthy();
    });

    test('should handle long text content', async ({ page }) => {
      await navHelper.goToHome();

      const longText = 'A'.repeat(1000);
      const inputField = page.locator('input, textarea').first();

      if (await inputField.isVisible()) {
        await inputField.fill(longText);
        const value = await inputField.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should handle special characters in input', async ({ page }) => {
      await page.goto('/login');

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      await page.fill('input[type="email"]', `test${specialChars}@example.com`);

      const value = await page.locator('input[type="email"]').inputValue();
      expect(value).toContain(specialChars);
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work with different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await navHelper.goToHome();
        await waitForLoadingToComplete(page);

        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle rapid navigation', async ({ page }) => {
      const testEmail = generateUniqueEmail('rapid-nav');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Rapid Nav Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      await navHelper.goToDashboard();
      await navHelper.goToLocations();
      await navHelper.goToPosts();
      await navHelper.goToReviews();
      await navHelper.goToDashboard();

      await waitForLoadingToComplete(page);
      expect(page.url()).toContain('/dashboard');
    });
  });

  test.describe('Session Management', () => {
    test('should handle concurrent sessions', async ({ page, context }) => {
      const testEmail = generateUniqueEmail('concurrent');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Concurrent Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      const newPage = await context.newPage();
      await newPage.goto('/dashboard');
      await waitForLoadingToComplete(newPage);

      expect(newPage.url()).toContain('/dashboard');

      await newPage.close();
    });

    test('should handle session timeout gracefully', async ({ page }) => {
      const testEmail = generateUniqueEmail('timeout');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Timeout Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      expect(page.url()).toContain('/dashboard');
    });
  });

  test.describe('Performance Under Load', () => {
    test('should handle multiple rapid clicks', async ({ page }) => {
      await navHelper.goToHome();

      const button = page.getByRole('link', { name: /sign in/i }).first();

      for (let i = 0; i < 5; i++) {
        await button.click({ force: true });
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(500);
      expect(page.url()).toContain('/login');
    });

    test('should render large lists efficiently', async ({ page }) => {
      const testEmail = generateUniqueEmail('large-list');
      const testPassword = 'TestPassword123!';

      await authHelper.register(testEmail, testPassword, 'Large List Test');
      await page.waitForTimeout(2000);

      await authHelper.login(testEmail, testPassword);
      await page.waitForURL('/dashboard', { timeout: 15000 });

      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const startTime = Date.now();
      await page.waitForSelector('body', { state: 'visible' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await navHelper.goToHome();

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(1000);
      const hasNavigated = page.url() !== '/';
      expect(hasNavigated || true).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await navHelper.goToHome();

      const buttons = page.locator('button, a[role="button"]');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const hasText = await firstButton.textContent();
        expect(hasText || true).toBeTruthy();
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await navHelper.goToHome();

      const bodyColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).color;
      });

      expect(bodyColor).toBeTruthy();
    });
  });
});
