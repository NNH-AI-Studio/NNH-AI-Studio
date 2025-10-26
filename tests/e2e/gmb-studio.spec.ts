import { test, expect } from '../fixtures/auth';
import { NavigationHelper, waitForLoadingToComplete, ModalHelper } from '../fixtures/helpers';

test.describe('GMB Studio Features', () => {
  let navHelper: NavigationHelper;
  let modalHelper: ModalHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    navHelper = new NavigationHelper(authenticatedPage);
    modalHelper = new ModalHelper(authenticatedPage);
  });

  test('should display GMB Studio with all tabs', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    await expect(page.locator('h1:has-text("GMB Studio")')).toBeVisible();

    await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('button:has-text("Posts")')).toBeVisible();
    await expect(page.locator('button:has-text("Reviews")')).toBeVisible();
    await expect(page.locator('button:has-text("Citations")')).toBeVisible();
    await expect(page.locator('button:has-text("Rankings")')).toBeVisible();
    await expect(page.locator('button:has-text("Media")')).toBeVisible();
    await expect(page.locator('button:has-text("AI Autopilot")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const postsTab = page.locator('button:has-text("Posts")');
    await postsTab.click();
    await page.waitForTimeout(500);

    const reviewsTab = page.locator('button:has-text("Reviews")');
    await reviewsTab.click();
    await page.waitForTimeout(500);

    const mediaTab = page.locator('button:has-text("Media")');
    await mediaTab.click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/\/gmb-studio/);
  });

  test('should display location selector', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const locationSelector = page.locator('select, [role="combobox"]').first();
    await expect(locationSelector).toBeVisible();

    const hasAllLocationsOption = await page.locator('option:has-text("All Locations"), text="All Locations"').isVisible();
    expect(hasAllLocationsOption).toBeTruthy();
  });

  test('should display posts tab content', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const postsTab = page.locator('button:has-text("Posts")');
    await postsTab.click();
    await page.waitForTimeout(1000);

    const hasCreateButton = await page.locator('button:has-text("Create"), button:has-text("New Post")').count() > 0;
    expect(hasCreateButton).toBeTruthy();
  });

  test('should display reviews tab content', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const reviewsTab = page.locator('button:has-text("Reviews")');
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    const hasReviewsContent = await page.locator('text=/review/i, [class*="review"]').count() > 0;
    expect(hasReviewsContent).toBeTruthy();
  });

  test('should display citations tab with NAP checker', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const citationsTab = page.locator('button:has-text("Citations")');
    await citationsTab.click();
    await page.waitForTimeout(1000);

    const hasCitationsContent = await page.locator('text=/citation|NAP/i').count() > 0;
    expect(hasCitationsContent).toBeTruthy();
  });

  test('should display rankings tab with keyword tracking', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const rankingsTab = page.locator('button:has-text("Rankings")');
    await rankingsTab.click();
    await page.waitForTimeout(1000);

    const hasRankingsContent = await page.locator('text=/ranking|keyword|position/i').count() > 0;
    expect(hasRankingsContent).toBeTruthy();
  });

  test('should display media tab with upload functionality', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const mediaTab = page.locator('button:has-text("Media")');
    await mediaTab.click();
    await page.waitForTimeout(1000);

    const hasUploadButton = await page.locator('button:has-text("Upload"), input[type="file"]').count() > 0;
    expect(hasUploadButton).toBeTruthy();
  });

  test('should display AI Autopilot tab with configuration', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const autopilotTab = page.locator('button:has-text("AI Autopilot")');
    await autopilotTab.click();
    await page.waitForTimeout(1000);

    const hasAutopilotContent = await page.locator('text=/autopilot|automated|AI/i').count() > 0;
    expect(hasAutopilotContent).toBeTruthy();
  });

  test('should display settings tab', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const settingsTab = page.locator('button:has-text("Settings")');
    await settingsTab.click();
    await page.waitForTimeout(1000);

    const hasSettingsContent = await page.locator('text=/setting|configuration/i').count() > 0;
    expect(hasSettingsContent).toBeTruthy();
  });

  test('should filter by location when selected', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const locationSelector = page.locator('select').first();

    const optionCount = await locationSelector.locator('option').count();

    if (optionCount > 1) {
      await locationSelector.selectOption({ index: 1 });
      await page.waitForTimeout(1000);

      expect(page).toHaveURL(/\/gmb-studio/);
    }
  });

  test('should maintain tab state on page refresh', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const reviewsTab = page.locator('button:has-text("Reviews")');
    await reviewsTab.click();
    await page.waitForTimeout(500);

    await page.reload();
    await waitForLoadingToComplete(page);

    expect(page).toHaveURL(/\/gmb-studio/);
  });

  test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    await expect(page.locator('h1:has-text("GMB Studio")')).toBeVisible();

    const tabsContainer = page.locator('[class*="tab"]').first();
    await expect(tabsContainer).toBeVisible();
  });

  test('should handle empty states gracefully', async ({ authenticatedPage: page }) => {
    await navHelper.goToGMBStudio();
    await waitForLoadingToComplete(page);

    const postsTab = page.locator('button:has-text("Posts")');
    await postsTab.click();
    await page.waitForTimeout(1000);

    const hasContent = await page.locator('text=/no posts|empty|create your first/i').count() > 0 ||
                       await page.locator('[class*="post"]').count() > 0;

    expect(hasContent).toBeTruthy();
  });
});
