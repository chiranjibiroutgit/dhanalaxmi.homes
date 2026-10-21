const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const screenshots = [];

  // Helper to take screenshot with description
  async function capture(name, url) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const path = `verification/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push({ name, path, url });
    console.log(`✓ Captured: ${name} (${url})`);
  }

  // 1. Homepage - verify new branding, hero, no RERA badges
  await capture('01-homepage', 'http://localhost:5174/');

  // 2. Verify no RERA marketing claims on homepage
  const reraHome = await page.locator('text=RERA').count();
  console.log(`  Homepage RERA mentions: ${reraHome}`);

  // 3. Property detail page - Sea Princess-1
  await capture('02-property-detail-seaprincess', 'http://localhost:5174/property/prop_102');
  const reraDetail = await page.locator('text=RERA Approved').count();
  console.log(`  Detail page "RERA Approved" badges: ${reraDetail}`);

  // 4. Property detail page - Blu Marina
  await capture('03-property-detail-blumarina', 'http://localhost:5174/property/prop_103');

  // 5. Property detail page - Sea Sand Lodge
  await capture('04-property-detail-seasand', 'http://localhost:5174/property/prop_105');

  // 6. Login page - verify security (no emails shown)
  await capture('05-login-page', 'http://localhost:5174/login');

  // 7. Verify wrong password rejected
  await page.fill('input[type="email"]', 'lingarajroutwork@gmail.com');
  await page.fill('input[autocomplete="current-password"]', 'wrongpassword');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(1000);
  const errorMsg = await page.locator('.bg-red-500/10').textContent().catch(() => 'no error shown');
  console.log(`  Wrong password error: ${errorMsg}`);
  const stillLogin = page.url().includes('/login');
  console.log(`  Still on login page (correct): ${stillLogin}`);
  await page.screenshot({ path: 'verification/06-wrong-password.png', fullPage: true });

  // 8. Correct login
  await page.fill('input[autocomplete="current-password"]', 'Dhanalaxmi@2024');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);
  console.log(`  After correct login URL: ${page.url()}`);
  await page.screenshot({ path: 'verification/07-after-login.png', fullPage: true });

  // 9. Dev Edit Panel
  if (page.url().includes('/dev')) {
    await capture('08-dev-edit-panel', page.url());
  } else {
    await capture('08-dev-edit-panel', 'http://localhost:5174/dev.edit.panel');
  }

  // 10. Admin Panel - verify dislike system
  await capture('09-admin-panel', 'http://localhost:5174/admin.panel');

  // 11. Dev Panel
  await capture('10-dev-panel', 'http://localhost:5174/devs.panel');

  await browser.close();

  console.log('\n=== Verification Complete ===');
  screenshots.forEach(s => console.log(`  ${s.name}: ${s.path}`));
  console.log('\nAll screenshots saved to ./verification/ folder');

})().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
