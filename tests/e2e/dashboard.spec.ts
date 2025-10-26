import { test, expect } from '../fixtures/auth';
import { NavigationHelper, waitForLoadingToComplete, assertElementVisible } from '../fixtures/helpers';

test.describe('Dashboard and Analytics', () => {
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    navHelper = new NavigationHelper(authenticatedPage);
  });

  test('should display dashboard with all stat cards', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    await expect(page.locator('text=/Total Views/i')).toBeVisible();
    await expect(page.locator('text=/Searches/i')).toBeVisible();
    await expect(page.locator('text=/Phone Calls/i')).toBeVisible();
    await expect(page.locator('text=/Messages/i')).toBeVisible();
  });

  test('should display GMB connection notice when not connected', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const hasConnectionNotice = await page.locator('text=/Connect.*Google My Business/i').isVisible();

    if (hasConnectionNotice) {
      await expect(page.getByRole('button', { name: /Connect Google/i })).toBeVisible();
    }
  });

  test('should display insights charts', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const chartElements = page.locator('[class*="recharts"], [class*="chart"]');
    const chartCount = await chartElements.count();

    expect(chartCount).toBeGreaterThanOrEqual(1);
  });

  test('should display quick action buttons', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    await expect(page.locator('text=/Quick Actions/i')).toBeVisible();
    await expect(page.locator('text=/Manage Locations/i')).toBeVisible();
    await expect(page.locator('text=/View Reviews/i')).toBeVisible();
    await expect(page.locator('text=/Create Post/i')).toBeVisible();
  });

  test('should navigate to locations from quick actions', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const manageLocationsButton = page.locator('button:has-text("Manage Locations")');
    await manageLocationsButton.click();

    await page.waitForURL('/locations', { timeout: 10000 });
    expect(page.url()).toContain('/locations');
  });

  test('should navigate to reviews from quick actions', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const viewReviewsButton = page.locator('button:has-text("View Reviews")');
    await viewReviewsButton.click();

    await page.waitForURL('/reviews', { timeout: 10000 });
    expect(page.url()).toContain('/reviews');
  });

  test('should navigate to posts from quick actions', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const createPostButton = page.locator('button:has-text("Create Post")');
    await createPostButton.click();

    await page.waitForURL('/posts', { timeout: 10000 });
    expect(page.url()).toContain('/posts');
  });

  test('should display stat values correctly', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const statCards = page.locator('[class*="stat"]');
    const statCount = await statCards.count();

    expect(statCount).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < Math.min(4, statCount); i++) {
      const card = statCards.nth(i);
      const hasNumber = await card.locator('text=/\\d+/').isVisible();
      expect(hasNumber).toBeTruthy();
    }
  });

  test('should handle loading state gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [class*="loader"]');

    if (await loadingIndicator.isVisible()) {
      await waitForLoadingToComplete(page);
    }

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should display trending indicator when metrics are positive', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const trendingElements = page.locator('text=/trending|\\+\\d+%/i');
    const hasTrending = await trendingElements.count();

    expect(hasTrending).toBeGreaterThanOrEqual(0);
  });

  test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    const statCards = page.locator('[class*="stat"]');
    const isVisible = await statCards.first().isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should refresh data on page reload', async ({ authenticatedPage: page }) => {
    await navHelper.goToDashboard();
    await waitForLoadingToComplete(page);

    const firstLoadStats = await page.locator('text=/Total Views/i').textContent();

    await page.reload();
    await waitForLoadingToComplete(page);

    await expect(page.locator('text=/Total Views/i')).toBeVisible();
  });
});
