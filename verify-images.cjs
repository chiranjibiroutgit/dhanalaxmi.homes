const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/images";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = [];

  const ids = ["prop_101", "prop_102", "prop_103", "prop_104", "prop_105"];

  // Public homepage
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/00-homepage-hero.png` });

  const grid = page.locator("#properties");
  if (await grid.count()) {
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/01-homepage-portfolio.png` });
  }

  for (const id of ids) {
    await page.goto(`${BASE}/property/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);

    // First gallery image keeps natural ratio
    const check = await page.evaluate(() => {
      const main = document.querySelector(".aspect-\\[16\\/10\\] img.object-contain");
      const thumbs = Array.from(document.querySelectorAll("button img.object-contain"));
      const ratioOk = (el) => {
        if (!el || !el.naturalWidth) return null;
        const nr = el.naturalWidth / el.naturalHeight;
        const rr = el.clientWidth / el.clientHeight;
        return Math.abs(nr - rr) / nr < 0.02;
      };
      return {
        title: document.querySelector("h1")?.innerText?.trim() || "",
        mainPresent: !!main,
        mainFit: main ? getComputedStyle(main).objectFit : null,
        mainNaturalRatioKept: ratioOk(main),
        thumbCount: thumbs.length,
        thumbsNaturalRatioKept: thumbs.every(ratioOk),
        imgCount: document.querySelectorAll("img").length,
        broken: Array.from(document.querySelectorAll("img")).filter(
          (i) => i.complete && i.naturalWidth === 0
        ).length,
      };
    });
    report.push({ id, ...check });

    await page.screenshot({ path: `${OUT}/${id}-detail-full.png`, fullPage: true });

    const gallery = page.locator(".aspect-\\[16\\/10\\]").first();
    if (await gallery.count()) {
      await gallery.screenshot({ path: `${OUT}/${id}-gallery.png` });
    }
  }

  // Cart page with images
  await page.goto(BASE + "/cart", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/02-cart.png` });

  await browser.close();
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
