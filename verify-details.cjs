const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/details";

const EXPECT = {
  prop_101: {
    title: "Panchtattva Agro Tourism Centre",
    price: "₹2,999/SQ. FT.",
    units: "55 Units",
    facts: ["1,500 m", "6 km", "2 decimals", "120 days", "Radha Krishna Temple", "Gaushala"],
  },
  prop_102: {
    title: "Sea Princess-1",
    price: "₹1,599/ SQ. FT.",
    units: "Phase 2 Layout",
    facts: ["113/1465", "Mangala River", "Yudhistir", "Naturopathy Centre", "Phase 2"],
  },
  prop_103: {
    title: "Blu Marina",
    price: "₹2,999/SQ. FT.",
    units: "26 Units",
    facts: ["500 m", "Chilika", "Jetty", "Kayaking", "Satapada Dolphin Point"],
  },
  prop_104: {
    title: "Sea Heaven",
    price: "₹1,799/SQ. FT.",
    units: "20+ Units",
    facts: ["900 sq. ft.", "1,350 sq. ft.", "1,566 sq. ft.", "2,000 sq. ft.", "Chilika"],
  },
  prop_105: {
    title: "Sea Sand Lodge",
    price: "₹2,099/SQ. FT",
    units: "51 Units",
    facts: ["770 sq. ft.", "880 sq. ft.", "7,02,000", "15,00,000", "120 days", "Gaushala"],
  },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => pageErrors.push(e.message));

  const report = [];

  for (const [id, exp] of Object.entries(EXPECT)) {
    await page.goto(`${BASE}/property/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 600));
      window.scrollTo(0, 0);
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })
        )
      );
    });
    await page.waitForTimeout(500);

    const info = await page.evaluate(() => {
      const body = document.body.innerText;
      const imgs = Array.from(document.images);
      return {
        h1: document.querySelector("h1")?.innerText.trim(),
        body,
        broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
        imgCount: imgs.length,
      };
    });

    const missingFacts = exp.facts.filter((f) => !info.body.includes(f));
    report.push({
      id,
      title: info.h1,
      titleOk: info.h1 === exp.title,
      priceOk: info.body.includes(exp.price),
      unitsOk: info.body.includes(exp.units),
      missingFacts,
      reraMentioned: /RERA/i.test(info.body),
      brokenImages: info.broken,
      imageCount: info.imgCount,
    });

    await page.screenshot({ path: `${OUT}/${id}-viewport.png` });
    await page.screenshot({ path: `${OUT}/${id}-full.png`, fullPage: true });

    // hero click -> no reader
    const gallery = page.locator("[data-gallery]").first();
    await gallery.click({ position: { x: 260, y: 150 } });
    await page.waitForTimeout(350);
    const heroOpened = await page.locator('[aria-label$="image reader"]').count();

    // brochure thumb -> main display -> reader opens and fits the screen
    const thumbs = page.locator("button:has(img.object-contain)");
    const thumbCount = await thumbs.count();
    let reader = { open: 0, fits: false };
    if (thumbCount > 4) {
      // close any open reader first
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      // click brochure thumbnail to set active index
      await thumbs.nth(4).click();
      await page.waitForTimeout(500);
      // click gallery to open reader for that brochure image
      await gallery.click({ position: { x: 300, y: 120 } });
      await page.waitForTimeout(800);
      reader = await page.evaluate(() => {
        const open = document.querySelectorAll('[aria-label$="image reader"]').length;
        const img = document.querySelector('[aria-label$="image reader"] img');
        if (!img) return { open, fits: false };
        const r = img.getBoundingClientRect();
        return {
          open,
          fits: r.width <= window.innerWidth + 2 && r.height <= window.innerHeight + 2 && r.width > 200,
          size: [Math.round(r.width), Math.round(r.height)],
          viewport: [window.innerWidth, window.innerHeight],
        };
      });
      await page.screenshot({ path: `${OUT}/${id}-reader.png` });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }

    report[report.length - 1].heroOpenedReader = heroOpened;
    report[report.length - 1].brochureReader = reader;
  }

  // Homepage: card chips + no RERA
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.locator("#properties").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/homepage-portfolio.png` });
  await page.screenshot({ path: `${OUT}/homepage-full.png`, fullPage: true });
  const home = await page.evaluate(() => ({
    body: document.body.innerText,
    chips: Array.from(document.querySelectorAll("[data-property-id] .spec-chip")).map((c) => c.innerText.trim()),
    broken: Array.from(document.images).filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
  }));

  const summary = {
    products: report,
    homepage: {
      reraMentioned: /RERA/i.test(home.body),
      chips: home.chips,
      brokenImages: home.broken,
    },
    consoleErrors,
    pageErrors,
  };
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
})();
