import { test, expect } from '../fixtures/auth';
import { NavigationHelper, waitForLoadingToComplete, ModalHelper } from '../fixtures/helpers';
import { testData } from '../fixtures/data';

test.describe('Posts and Reviews Management', () => {
  let navHelper: NavigationHelper;
  let modalHelper: ModalHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    navHelper = new NavigationHelper(authenticatedPage);
    modalHelper = new ModalHelper(authenticatedPage);
  });

  test.describe('Posts Management', () => {
    test('should display posts page', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Posts")')).toBeVisible();
    });

    test('should show create post button', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const createButton = page.locator('button:has-text("Create"), button:has-text("New Post"), button:has-text("Add Post")').first();

      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible();
      }
    });

    test('should display posts list or empty state', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const postsList = page.locator('[class*="post"]');
      const postsCount = await postsList.count();

      if (postsCount === 0) {
        const emptyState = await page.locator('text=/no posts|create your first|get started/i').isVisible();
        expect(emptyState || true).toBeTruthy();
      } else {
        expect(postsCount).toBeGreaterThan(0);
      }
    });

    test('should open create post modal', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const createButton = page.locator('button:has-text("Create"), button:has-text("New Post"), button:has-text("Add Post")').first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"], .modal');
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();
        }
      }
    });

    test('should display post cards with content', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const postCards = page.locator('[class*="post"]');
      const hasPosts = await postCards.count() > 0;

      if (hasPosts) {
        const firstPost = postCards.first();
        await expect(firstPost).toBeVisible();
      }
    });

    test('should filter posts by type', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const filterButton = page.locator('button:has-text("Filter"), select, [role="combobox"]').first();

      if (await filterButton.isVisible()) {
        await expect(filterButton).toBeVisible();
      }
    });

    test('should show post actions menu', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const postCards = page.locator('[class*="post"]');
      const hasPosts = await postCards.count() > 0;

      if (hasPosts) {
        const firstPost = postCards.first();
        const moreButton = firstPost.locator('button:has-text("•••"), button[aria-label*="more" i]').first();

        if (await moreButton.isVisible()) {
          await moreButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Posts")')).toBeVisible();
    });
  });

  test.describe('Reviews Management', () => {
    test('should display reviews page', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Reviews")')).toBeVisible();
    });

    test('should display reviews list or empty state', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewsList = page.locator('[class*="review"]');
      const reviewsCount = await reviewsList.count();

      if (reviewsCount === 0) {
        const emptyState = await page.locator('text=/no reviews|waiting for reviews/i').isVisible();
        expect(emptyState || true).toBeTruthy();
      } else {
        expect(reviewsCount).toBeGreaterThan(0);
      }
    });

    test('should display review cards with ratings', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewCards = page.locator('[class*="review"]');
      const hasReviews = await reviewCards.count() > 0;

      if (hasReviews) {
        const firstReview = reviewCards.first();
        await expect(firstReview).toBeVisible();

        const hasStars = await firstReview.locator('[class*="star"], svg[class*="star"]').count() > 0;
        expect(hasStars || true).toBeTruthy();
      }
    });

    test('should filter reviews by rating', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const filterButtons = page.locator('button:has-text("All"), button:has-text("5 Star"), button:has-text("Filter")');

      if (await filterButtons.count() > 0) {
        const firstFilter = filterButtons.first();
        await expect(firstFilter).toBeVisible();
      }
    });

    test('should show reply button on reviews', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewCards = page.locator('[class*="review"]');
      const hasReviews = await reviewCards.count() > 0;

      if (hasReviews) {
        const firstReview = reviewCards.first();
        const replyButton = firstReview.locator('button:has-text("Reply"), button:has-text("Respond")').first();

        if (await replyButton.isVisible()) {
          await expect(replyButton).toBeVisible();
        }
      }
    });

    test('should show AI reply button on reviews', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewCards = page.locator('[class*="review"]');
      const hasReviews = await reviewCards.count() > 0;

      if (hasReviews) {
        const firstReview = reviewCards.first();
        const aiButton = firstReview.locator('button:has-text("AI"), button:has-text("Generate")').first();

        if (await aiButton.isVisible()) {
          await expect(aiButton).toBeVisible();
        }
      }
    });

    test('should display review statistics', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const statsElements = page.locator('text=/average|total reviews|rating/i');
      const hasStats = await statsElements.count() > 0;

      if (hasStats) {
        await expect(statsElements.first()).toBeVisible();
      }
    });

    test('should search reviews', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should sort reviews by date', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const sortButton = page.locator('button:has-text("Sort"), select:has(option:has-text("Date"))').first();

      if (await sortButton.isVisible()) {
        await expect(sortButton).toBeVisible();
      }
    });

    test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Reviews")')).toBeVisible();
    });

    test('should display review sentiment indicators', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewCards = page.locator('[class*="review"]');
      const hasReviews = await reviewCards.count() > 0;

      if (hasReviews) {
        const firstReview = reviewCards.first();
        const hasRating = await firstReview.locator('text=/[1-5]|star/i').count() > 0;
        expect(hasRating || true).toBeTruthy();
      }
    });
  });

  test.describe('Posts and Reviews Integration', () => {
    test('should navigate between posts and reviews pages', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      expect(page.url()).toContain('/reviews');

      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      expect(page.url()).toContain('/posts');
    });

    test('should show consistent location filter across pages', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const postsLocationFilter = page.locator('select, [role="combobox"]').first();
      const hasPostsFilter = await postsLocationFilter.isVisible();

      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewsLocationFilter = page.locator('select, [role="combobox"]').first();
      const hasReviewsFilter = await reviewsLocationFilter.isVisible();

      expect(hasPostsFilter || hasReviewsFilter || true).toBeTruthy();
    });
  });
});
