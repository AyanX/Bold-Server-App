const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => localStorage.setItem('isLoggedIn', 'true'));
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('text=System Users', { timeout: 15000 });

    await page.click('text=Invite User');

    const uniqueEmail = `node_test_${Date.now()}@example.com`;

    await page.fill('input[type="text"]', 'Node Playwright Tester');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.selectOption('select', 'Contributor');
    await page.fill('input[placeholder="https://linkedin.com/in/username"]', 'https://linkedin.com/in/nodeplay');
    await page.fill('textarea', 'Bio from node script');

    const filePath = path.resolve(__dirname, '..', 'public', 'logo.png');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.click('button[type="submit"]');

    await page.waitForSelector(`text=Node Playwright Tester`, { timeout: 15000 });

    console.log('SUCCESS: User created with email', uniqueEmail);
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('TEST FAILED', e);
    await browser.close();
    process.exit(2);
  }
})();
