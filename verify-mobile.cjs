const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const out = "verification/details";
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  for (const id of ["prop_101", "prop_102", "prop_103", "prop_104", "prop_105"]) {
    await page.goto(`http://localhost:5174/property/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 700));
      window.scrollTo(0, 0);
    });
    const info = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: Array.from(document.images).filter((i) => !i.naturalWidth).length,
      title: document.querySelector("h1")?.innerText.trim(),
      h1Size: getComputedStyle(document.querySelector("h1")).fontSize,
    }));
    await page.screenshot({ path: `${out}/${id}-mobile.png`, fullPage: true });
    results.push({ id, ...info });
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
