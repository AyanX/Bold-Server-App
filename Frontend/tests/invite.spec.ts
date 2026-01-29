import { test, expect } from '@playwright/test';
import path from 'path';

test('invite and create user via dashboard', async ({ page }) => {
  // Ensure dashboard auth flag
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('isLoggedIn', 'true'));

  // Open dashboard
  await page.goto('/dashboard');

  // Wait for the users section to be visible
  await page.waitForSelector('text=System Users');

  // Open Invite User modal
  await page.click('text=Invite User');

  const modal = page.locator('form');

  const uniqueEmail = `testuser+${Date.now()}@example.com`;

  // Fill form fields
  await modal.locator('input[type="text"]').fill('Playwright Tester');
  await modal.locator('input[type="email"]').fill(uniqueEmail);
  await modal.locator('select').selectOption('Contributor');
  await modal.locator('input[placeholder="https://linkedin.com/in/username"]').fill('https://linkedin.com/in/playwrighttester');
  await modal.locator('textarea').fill('This is a test bio created by Playwright.');

  // Upload an image from the repo's public folder
  const filePath = path.resolve(process.cwd(), 'public', 'logo.png');
  await modal.locator('input[type="file"]').setInputFiles(filePath);

  // Submit the form
  await modal.locator('button[type="submit"]').click();

  // Wait for modal to close and new user to appear in table
  await page.waitForSelector(`text=Playwright Tester`, { timeout: 15000 });

  // Verify the created user email is visible
  await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible({ timeout: 15000 });
});
