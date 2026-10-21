const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/final";
const ids = ["prop_101", "prop_102", "prop_103", "prop_104", "prop_105"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const id of ids) {
    await page.goto(`${BASE}/property/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const g = page.locator("[data-gallery]").first();
    await g.screenshot({ path: `${OUT}/hero-${id}.png` });
    console.log("saved", id);
  }
  await browser.close();
})();
