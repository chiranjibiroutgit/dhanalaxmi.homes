const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/final";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const pages = [
    { name: "01-homepage", url: BASE + "/" },
    { name: "02-product-panchtattva", url: BASE + "/property/prop_101" },
    { name: "03-product-seaprincess", url: BASE + "/property/prop_102" },
    { name: "04-product-blumarina", url: BASE + "/property/prop_103" },
    { name: "05-product-seaheaven", url: BASE + "/property/prop_104" },
    { name: "06-product-seasand", url: BASE + "/property/prop_105" },
    { name: "07-login", url: BASE + "/login" },
    { name: "08-signup", url: BASE + "/signup" },
    { name: "09-forgot-password", url: BASE + "/forgot-password" },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    // Ensure all images load
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })
        )
      );
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
    console.log(`✓ Captured: ${p.name}`);
  }

  // Mobile screenshots
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mobilePages = [
    { name: "10-mobile-homepage", url: BASE + "/" },
    { name: "11-mobile-product-panchtattva", url: BASE + "/property/prop_101" },
    { name: "12-mobile-product-seaprincess", url: BASE + "/property/prop_102" },
    { name: "13-mobile-product-blumarina", url: BASE + "/property/prop_103" },
    { name: "14-mobile-product-seaheaven", url: BASE + "/property/prop_104" },
    { name: "15-mobile-product-seasand", url: BASE + "/property/prop_105" },
    { name: "16-mobile-login", url: BASE + "/login" },
    { name: "17-mobile-signup", url: BASE + "/signup" },
  ];
  for (const p of mobilePages) {
    await mobilePage.goto(p.url, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.evaluate(async () => {
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })
        )
      );
    });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
    console.log(`✓ Captured mobile: ${p.name}`);
  }

  await browser.close();
  console.log("\n✅ All screenshots captured in verification/final/");
})();
