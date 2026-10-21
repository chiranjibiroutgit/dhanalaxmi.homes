const { chromium } = require("playwright");

const BASE = "http://localhost:5174";
const routes = ["/", "/property/prop_101", "/property/prop_102", "/property/prop_103", "/property/prop_104", "/property/prop_105", "/cart", "/me", "/login", "/devs.panel", "/admin.panel", "/dev.edit.panel"];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push({ url: page.url(), text: m.text().slice(0, 200) });
  });
  page.on("pageerror", (e) => errors.push({ url: page.url(), text: "PAGEERROR " + e.message.slice(0, 200) }));

  // sign in once so panels are reachable
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "lingarajroutwork@gmail.com");
  await page.fill('input[type="password"]', "anypassword123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);

  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => ({
      title: document.title,
      imgs: document.images.length,
      broken: Array.from(document.images).filter((i) => i.complete && !i.naturalWidth).length,
    }));
    console.log(r.padEnd(26), JSON.stringify(info));
  }
  await browser.close();
  console.log("\nCONSOLE ERRORS:", errors.length);
  errors.slice(0, 10).forEach((e) => console.log(" -", e.url, e.text));
})().catch((e) => { console.error(e); process.exit(1); });
