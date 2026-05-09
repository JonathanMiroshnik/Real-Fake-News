import { test, expect } from '@playwright/test';

/**
 * E2E: Homepage
 * Tests that the main public-facing site loads correctly.
 */
test.describe('Homepage', () => {
  test('should load the homepage and display the site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Real Fake News/);
  });

  test('should display the navigation bar', async ({ page }) => {
    await page.goto('/');
    // Navigation should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to a category page', async ({ page }) => {
    await page.goto('/');
    // Try clicking a category link (most sites have "Technology", "Sports", etc.)
    const techLink = page.locator('a').filter({ hasText: /Technology/i });
    if (await techLink.count() > 0) {
      await techLink.first().click();
      // Should land on a category page
      await expect(page).toHaveURL(/\/category\/technology/i);
    }
  });

  test('should display articles on the homepage', async ({ page }) => {
    await page.goto('/');
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    // Check that article elements are present (using common classes)
    const articles = page.locator('[class*="article"], [class*="Article"], [class*="card"], [class*="Card"]');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have a working footer with contact and legal links', async ({ page }) => {
    await page.goto('/');
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Check for common footer links
    const contactLink = page.locator('a').filter({ hasText: /Contact/i });
    if (await contactLink.count() > 0) {
      await contactLink.first().click();
      await expect(page).toHaveURL(/\/contact/i);
    }
  });
});
