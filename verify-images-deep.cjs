const { chromium } = require("playwright");

const BASE = "http://localhost:5174";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const ids = ["prop_101", "prop_102", "prop_103", "prop_104", "prop_105"];

  for (const id of ids) {
    await page.goto(`${BASE}/property/${id}`, { waitUntil: "networkidle" });
    // force every lazy image to load
    await page.evaluate(async () => {
      document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })
        )
      );
    });
    await page.waitForTimeout(1500);

    const res = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      const broken = imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src"));
      const thumbs = Array.from(document.querySelectorAll("button img.object-contain"));
      const thumbInfo = thumbs.map((el) => {
        const nr = el.naturalWidth / el.naturalHeight;
        const rr = el.clientWidth / el.clientHeight;
        return {
          src: el.getAttribute("src"),
          natural: [el.naturalWidth, el.naturalHeight],
          box: [el.clientWidth, el.clientHeight],
          ratioDelta: Number(Math.abs(nr - rr).toFixed(4)),
        };
      });
      const main = document.querySelector("img.object-contain");
      return {
        broken,
        thumbs: thumbInfo,
        main: main && {
          src: main.getAttribute("src"),
          fit: getComputedStyle(main).objectFit,
          natural: [main.naturalWidth, main.naturalHeight],
        },
      };
    });
    console.log(id, JSON.stringify(res, null, 2));
  }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
