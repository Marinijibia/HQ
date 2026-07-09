import { test, expect } from '@playwright/test';

test.describe('HQ User Journey E2E Flows', () => {
  test('should render dashboard welcome banner and statistics row', async ({ page }) => {
    // Navigate to local server instance
    await page.goto('http://localhost:3000/dashboard');

    // Confirm core dashboard view mounts
    await expect(page.locator('h1')).toContainText('Welcome back, Elena');

    // Confirm that the Available Credits stats card is visible
    await expect(page.getByText('Available Credits')).toBeVisible();
    await expect(page.getByText('9,420')).toBeVisible();
  });

  test('should display active mission timeline progression', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Confirm Active Mission Control card details are rendered
    await expect(page.getByText('Q3 Petroleum Logistics Outreach')).toBeVisible();
    await expect(page.getByText('Rashid (Petroleum Director)')).toBeVisible();
  });

  test('should navigate settings directory and invite new member', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');

    // Confirm Directory List details mount
    await expect(page.getByText('Elena Rostova')).toBeVisible();

    // Fill invitation form fields
    await page.getByPlaceholder('name@company.com').fill('test-member@hq.corp');
    await page.locator('select').first().selectOption('Team Lead');

    // Submit invitation trigger
    await page.getByRole('button', { name: 'Send Invite' }).click();

    // Verify list updates containing the new email
    await expect(page.getByText('test-member')).toBeVisible();
  });
});
