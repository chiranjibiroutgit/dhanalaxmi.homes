const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/final";
const ids = ["prop_101", "prop_102", "prop_103", "prop_104", "prop_105"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = [];

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/homepage-hero.png` });
  await page.locator("#properties").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/homepage-portfolio.png` });

  for (const id of ids) {
    await page.goto(`${BASE}/property/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })
        )
      );
    });
    await page.waitForTimeout(800);

    const base = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      const hero = document.querySelector("img.object-contain");
      return {
        title: document.querySelector("h1")?.innerText.trim(),
        broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
        heroSrc: hero?.getAttribute("src"),
        heroNatural: hero ? [hero.naturalWidth, hero.naturalHeight] : null,
        thumbs: document.querySelectorAll("button img.object-contain").length,
      };
    });

    // hero click must NOT open the reader
    const gallery = page.locator("[data-gallery]").first();
    await gallery.click({ position: { x: 300, y: 160 } });
    await page.waitForTimeout(400);
    const heroOpened = await page.locator('[aria-label$="image reader"]').count();

    // choose a brochure image (index 4) via its thumbnail
    const thumbs = page.locator("button:has(img.object-contain)");
    await thumbs.nth(4).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${id}-brochure-in-frame.png` });

    const readerInfo = await page.evaluate(() => {
      const img = document.querySelector("img.object-contain");
      return {
        src: img?.getAttribute("src"),
        natural: img ? [img.naturalWidth, img.naturalHeight] : null,
        box: img ? [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)] : null,
        fit: img ? getComputedStyle(img).objectFit : null,
      };
    });

    // open reader
    await gallery.click({ position: { x: 300, y: 160 } });
    await page.waitForTimeout(700);
    const dialog = page.locator('[aria-label$="image reader"]');
    const opened = await dialog.count();

    let fitInfo = null;
    let zoomInfo = null;
    if (opened) {
      fitInfo = await page.evaluate(() => {
        const d = document.querySelector('[aria-label$="image reader"]');
        const img = d.querySelector("img");
        const r = img.getBoundingClientRect();
        return {
          fit: getComputedStyle(img).objectFit,
          box: [Math.round(r.width), Math.round(r.height)],
          natural: [img.naturalWidth, img.naturalHeight],
          viewport: [window.innerWidth, window.innerHeight],
          fitsScreen: r.width <= window.innerWidth && r.height <= window.innerHeight,
          ratioKept:
            Math.abs(img.naturalWidth / img.naturalHeight - r.width / r.height) <
            0.02,
        };
      });
      await page.screenshot({ path: `${OUT}/${id}-reader-fit.png` });

      await page.getByLabel("Zoom in").click();
      await page.getByLabel("Zoom in").click();
      await page.waitForTimeout(700);
      zoomInfo = await page.evaluate(() => {
        const d = document.querySelector('[aria-label$="image reader"]');
        const img = d.querySelector("img");
        const r = img.getBoundingClientRect();
        const label = d.querySelector('button[aria-label="Reset zoom"]')?.innerText;
        return {
          box: [Math.round(r.width), Math.round(r.height)],
          zoomLabel: label,
          ratioKept: Math.abs(img.naturalWidth / img.naturalHeight - r.width / r.height) < 0.02,
        };
      });
      await page.screenshot({ path: `${OUT}/${id}-reader-zoomed.png` });
      await page.getByLabel("Close viewer").click();
      await page.waitForTimeout(300);
    }

    report.push({ id, ...base, heroOpened, brochureImage: readerInfo, readerOpened: opened, fitInfo, zoomInfo });
    console.log(JSON.stringify(report[report.length - 1], null, 2));
  }

  await browser.close();
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
