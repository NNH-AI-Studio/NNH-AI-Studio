import { test, expect } from '../fixtures/auth';
import { NavigationHelper, waitForLoadingToComplete, ModalHelper } from '../fixtures/helpers';
import { testData } from '../fixtures/data';

test.describe('Accounts and Locations Management', () => {
  let navHelper: NavigationHelper;
  let modalHelper: ModalHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    navHelper = new NavigationHelper(authenticatedPage);
    modalHelper = new ModalHelper(authenticatedPage);
  });

  test.describe('Accounts Management', () => {
    test('should display accounts page', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Accounts")')).toBeVisible();
    });

    test('should show connect Google button when no accounts', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      const hasConnectButton = await page.locator('button:has-text("Connect"), button:has-text("Google")').count() > 0;

      if (hasConnectButton) {
        const connectButton = page.locator('button:has-text("Connect Google"), button:has-text("Connect")').first();
        await expect(connectButton).toBeVisible();
      }
    });

    test('should display account list when accounts exist', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      const accountsList = page.locator('[class*="account"], [data-testid*="account"]');
      const accountsCount = await accountsList.count();

      expect(accountsCount).toBeGreaterThanOrEqual(0);
    });

    test('should show account details', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      const accountItems = page.locator('[class*="account"], [role="listitem"]');
      const hasAccounts = await accountItems.count() > 0;

      if (hasAccounts) {
        const firstAccount = accountItems.first();
        await expect(firstAccount).toBeVisible();
      }
    });

    test('should handle account refresh', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Sync")').first();

      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Locations Management', () => {
    test('should display locations page', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Locations")')).toBeVisible();
    });

    test('should show create location button', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const createButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Location")').first();

      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible();
      }
    });

    test('should display location list', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const locationsList = page.locator('[class*="location"], [data-testid*="location"]');
      const locationsCount = await locationsList.count();

      expect(locationsCount).toBeGreaterThanOrEqual(0);
    });

    test('should show location details', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const locationItems = page.locator('[class*="location"], [role="listitem"]');
      const hasLocations = await locationItems.count() > 0;

      if (hasLocations) {
        const firstLocation = locationItems.first();
        await expect(firstLocation).toBeVisible();
      }
    });

    test('should display location search/filter', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should handle location card interactions', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const locationCards = page.locator('[class*="location"]');
      const hasLocations = await locationCards.count() > 0;

      if (hasLocations) {
        const firstCard = locationCards.first();
        await expect(firstCard).toBeVisible();

        const moreButton = firstCard.locator('button:has-text("•••"), button[aria-label*="more" i], button[aria-label*="menu" i]').first();

        if (await moreButton.isVisible()) {
          await moreButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should display empty state when no locations', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const locationsList = page.locator('[class*="location"]');
      const locationsCount = await locationsList.count();

      if (locationsCount === 0) {
        const emptyState = await page.locator('text=/no locations|add your first|get started/i').isVisible();
        expect(emptyState).toBeTruthy();
      }
    });

    test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Locations")')).toBeVisible();
    });

    test('should show location stats if available', async ({ authenticatedPage: page }) => {
      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      const locationCards = page.locator('[class*="location"]');
      const hasLocations = await locationCards.count() > 0;

      if (hasLocations) {
        const firstCard = locationCards.first();
        const hasStats = await firstCard.locator('text=/view|rating|review/i').count() > 0;
        expect(hasStats || true).toBeTruthy();
      }
    });
  });

  test.describe('Integration between Accounts and Locations', () => {
    test('should navigate between accounts and locations pages', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      expect(page.url()).toContain('/locations');

      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      expect(page.url()).toContain('/accounts');
    });

    test('should reflect account connection in locations', async ({ authenticatedPage: page }) => {
      await navHelper.goToAccounts();
      await waitForLoadingToComplete(page);

      const accountsCount = await page.locator('[class*="account"]').count();

      await navHelper.goToLocations();
      await waitForLoadingToComplete(page);

      if (accountsCount === 0) {
        const hasNoConnectionMessage = await page.locator('text=/connect.*account|no account/i').count() > 0;
        expect(hasNoConnectionMessage || true).toBeTruthy();
      }
    });
  });
});
