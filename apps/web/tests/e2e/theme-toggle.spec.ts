import { test, expect } from '@playwright/test';

test.describe('HQ Theme Toggle E2E Flow', () => {
  test('should toggle html dark class on landing page header click', async ({ page }) => {
    // Navigate to public home page
    await page.goto('http://localhost:3000/');

    // 1. Initial State: should have dark class by default
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // 2. Click Toggler: should remove dark class (switch to light mode)
    const toggleButton = page.locator('button[aria-label="Toggle Theme"]').first();
    await toggleButton.click();
    await expect(htmlElement).not.toHaveClass(/dark/);

    // 3. Click Toggler again: should re-apply dark class
    await toggleButton.click();
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should retain theme status across pricing and integrations routes navigation', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/pricing');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Toggle to light mode
    const toggleButton = page.locator('button[aria-label="Toggle Theme"]').first();
    await toggleButton.click();
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Navigate to integrations page
    await page.goto('http://localhost:3000/integrations');

    // Theme should be preserved in localStorage and applied on mount
    await expect(htmlElement).not.toHaveClass(/dark/);
  });
});
