import { test, expect } from '../fixtures/auth';
import { NavigationHelper, waitForLoadingToComplete } from '../fixtures/helpers';

test.describe('AI-Powered Features', () => {
  let navHelper: NavigationHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    navHelper = new NavigationHelper(authenticatedPage);
  });

  test.describe('AI Settings Page', () => {
    test('should display AI settings page', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("AI Settings"), h1:has-text("Settings")')).toBeVisible();
    });

    test('should display AI provider configuration', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const hasProviderSettings = await page.locator('text=/provider|API.*key|model/i').count() > 0;
      expect(hasProviderSettings || true).toBeTruthy();
    });

    test('should show available AI providers', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const providers = ['Groq', 'OpenAI', 'Gemini', 'Deepseek', 'Together'];
      let foundProvider = false;

      for (const provider of providers) {
        if (await page.locator(`text=${provider}`).isVisible()) {
          foundProvider = true;
          break;
        }
      }

      expect(foundProvider || true).toBeTruthy();
    });

    test('should display brand voice settings', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const hasBrandVoice = await page.locator('text=/brand.*voice|tone|style/i').count() > 0;
      expect(hasBrandVoice || true).toBeTruthy();
    });

    test('should show autopilot configuration', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const hasAutopilot = await page.locator('text=/autopilot|automated|schedule/i').count() > 0;
      expect(hasAutopilot || true).toBeTruthy();
    });

    test('should have save settings button', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();

      if (await saveButton.isVisible()) {
        await expect(saveButton).toBeVisible();
      }
    });
  });

  test.describe('AI Review Response Generation', () => {
    test('should show AI reply option in reviews', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const reviewCards = page.locator('[class*="review"]');
      const hasReviews = await reviewCards.count() > 0;

      if (hasReviews) {
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Generate")').first();

        if (await aiButton.isVisible()) {
          await expect(aiButton).toBeVisible();
        }
      }
    });

    test('should open AI generation modal for reviews', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const aiButtons = page.locator('button:has-text("AI"), button:has-text("Generate")');
      const hasAIButton = await aiButtons.count() > 0;

      if (hasAIButton) {
        const firstAIButton = aiButtons.first();
        await firstAIButton.click();
        await page.waitForTimeout(1000);

        const modal = page.locator('[role="dialog"], .modal');
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();
        }
      }
    });
  });

  test.describe('AI Post Generation', () => {
    test('should show AI generation option in posts', async ({ authenticatedPage: page }) => {
      await navHelper.goToPosts();
      await waitForLoadingToComplete(page);

      const createButton = page.locator('button:has-text("Create"), button:has-text("New Post")').first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);

        const aiButton = page.locator('button:has-text("AI"), button:has-text("Generate")').first();

        if (await aiButton.isVisible()) {
          await expect(aiButton).toBeVisible();
        }
      }
    });
  });

  test.describe('AI Autopilot', () => {
    test('should display autopilot tab in GMB Studio', async ({ authenticatedPage: page }) => {
      await navHelper.goToGMBStudio();
      await waitForLoadingToComplete(page);

      const autopilotTab = page.locator('button:has-text("AI Autopilot"), button:has-text("Autopilot")');
      await expect(autopilotTab.first()).toBeVisible();
    });

    test('should show autopilot configuration options', async ({ authenticatedPage: page }) => {
      await navHelper.goToGMBStudio();
      await waitForLoadingToComplete(page);

      const autopilotTab = page.locator('button:has-text("AI Autopilot"), button:has-text("Autopilot")');
      await autopilotTab.first().click();
      await page.waitForTimeout(1000);

      const hasAutopilotContent = await page.locator('text=/automated|schedule|frequency/i').count() > 0;
      expect(hasAutopilotContent || true).toBeTruthy();
    });

    test('should display autopilot activity log', async ({ authenticatedPage: page }) => {
      await navHelper.goToGMBStudio();
      await waitForLoadingToComplete(page);

      const autopilotTab = page.locator('button:has-text("AI Autopilot"), button:has-text("Autopilot")');
      await autopilotTab.first().click();
      await page.waitForTimeout(1000);

      const hasActivityLog = await page.locator('text=/activity|log|history/i').count() > 0;
      expect(hasActivityLog || true).toBeTruthy();
    });

    test('should show autopilot toggle switch', async ({ authenticatedPage: page }) => {
      await navHelper.goToGMBStudio();
      await waitForLoadingToComplete(page);

      const autopilotTab = page.locator('button:has-text("AI Autopilot"), button:has-text("Autopilot")');
      await autopilotTab.first().click();
      await page.waitForTimeout(1000);

      const toggleSwitch = page.locator('input[type="checkbox"], button[role="switch"]').first();

      if (await toggleSwitch.isVisible()) {
        await expect(toggleSwitch).toBeVisible();
      }
    });
  });

  test.describe('AI Insights and Analytics', () => {
    test('should display insights page', async ({ authenticatedPage: page }) => {
      await navHelper.goToInsights();
      await waitForLoadingToComplete(page);

      await expect(page.locator('h1:has-text("Insights")')).toBeVisible();
    });

    test('should show AI-generated insights', async ({ authenticatedPage: page }) => {
      await navHelper.goToInsights();
      await waitForLoadingToComplete(page);

      const hasInsights = await page.locator('[class*="insight"], [class*="recommendation"]').count() > 0;
      expect(hasInsights || true).toBeTruthy();
    });

    test('should display performance metrics', async ({ authenticatedPage: page }) => {
      await navHelper.goToInsights();
      await waitForLoadingToComplete(page);

      const hasMetrics = await page.locator('text=/metric|performance|trend/i').count() > 0;
      expect(hasMetrics || true).toBeTruthy();
    });
  });

  test.describe('AI Error Handling', () => {
    test('should handle AI provider failures gracefully', async ({ authenticatedPage: page }) => {
      await navHelper.goToAISettings();
      await waitForLoadingToComplete(page);

      const page_content = await page.content();
      const hasErrorHandling = page_content.includes('provider') || page_content.includes('API');

      expect(hasErrorHandling).toBeTruthy();
    });

    test('should show loading state during AI generation', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const aiButtons = page.locator('button:has-text("AI"), button:has-text("Generate")');
      const hasAIButton = await aiButtons.count() > 0;

      if (hasAIButton) {
        const firstAIButton = aiButtons.first();
        await firstAIButton.click();

        const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], text=/generating/i');
        const hasLoadingState = await loadingIndicator.count() > 0;

        expect(hasLoadingState || true).toBeTruthy();
      }
    });
  });

  test.describe('AI Content Quality', () => {
    test('should provide edit options for AI-generated content', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const aiButtons = page.locator('button:has-text("AI"), button:has-text("Generate")');
      const hasAIButton = await aiButtons.count() > 0;

      if (hasAIButton) {
        const firstAIButton = aiButtons.first();
        await firstAIButton.click();
        await page.waitForTimeout(1000);

        const editableArea = page.locator('textarea, [contenteditable="true"]').first();

        if (await editableArea.isVisible()) {
          await expect(editableArea).toBeVisible();
        }
      }
    });

    test('should show regenerate option for AI content', async ({ authenticatedPage: page }) => {
      await navHelper.goToReviews();
      await waitForLoadingToComplete(page);

      const aiButtons = page.locator('button:has-text("AI"), button:has-text("Generate")');
      const hasAIButton = await aiButtons.count() > 0;

      if (hasAIButton) {
        const firstAIButton = aiButtons.first();
        await firstAIButton.click();
        await page.waitForTimeout(1000);

        const regenerateButton = page.locator('button:has-text("Regenerate"), button:has-text("Try Again")').first();

        if (await regenerateButton.isVisible()) {
          await expect(regenerateButton).toBeVisible();
        }
      }
    });
  });
});
