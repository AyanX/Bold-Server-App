const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    console.log('Navigating to root');
    await page.goto('http://localhost:3002', { waitUntil: 'load', timeout: 30000 });
    console.log('Setting localStorage isLoggedIn');
    await page.evaluate(() => localStorage.setItem('isLoggedIn', 'true'));
    console.log('Navigating to /dashboard');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'load', timeout: 30000 });
    const snapshot = await page.content();
    console.log('Page content snapshot (first 500 chars):', snapshot.slice(0, 500));
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || '');
    console.log('ROOT HTML (first 500 chars):', rootHtml.slice(0, 500));
    console.log('Clicking Invite User button');
    await page.click('button:text("Invite User")', { timeout: 15000 });

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
