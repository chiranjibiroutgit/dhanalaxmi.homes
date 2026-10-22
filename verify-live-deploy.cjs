const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "https://dhanalaxmigroup-in.web.app";
const OUT = "verification/live-deploy";
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.setDefaultTimeout(20000);
  const errors = [];
  desktop.on("pageerror", (error) => errors.push(error.message));
  desktop.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await desktop.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await desktop.waitForSelector("#home h1", { timeout: 20000 });
  await desktop.waitForTimeout(1500);

  const home = await desktop.evaluate(() => ({
    url: window.location.href,
    rootChildren: document.getElementById("root")?.children.length || 0,
    bodyTextLength: document.body.innerText.trim().length,
    bodyTextStart: document.body.innerText.trim().slice(0, 100),
    heroHeading: document.querySelector("#home h1")?.innerText.trim() || "",
    cards: document.querySelectorAll("article[data-property-id]").length,
    locationBadge: document.querySelector('[data-edit-key="hero.eyebrow"]')?.innerText || "",
    negotiationNotes: Array.from(document.querySelectorAll("p")).filter((p) =>
      p.textContent.includes("Guaranteed – Negotiation by contact"),
    ).length,
    hasSearch: Boolean(document.querySelector('form[role="search"]')),
    hasGoalFilter: Boolean(document.querySelector("#market-goal")),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rera: /RERA/i.test(document.body.innerText),
    stylesheets: document.styleSheets.length,
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  }));

  check(home.rootChildren > 0, "Live React root is empty (black/blank screen)");
  check(home.bodyTextLength > 200, "Live page has almost no text");
  check(home.heroHeading.includes("Modern Living"), "Live hero heading missing");
  check(home.cards === 5, `Live cards: ${home.cards}, expected 5`);
  check(home.hasSearch, "Live search form missing");
  check(home.hasGoalFilter, "Live goal filter missing");
  check(home.negotiationNotes > 0, "Live negotiation note missing");
  check(!home.rera, "Live site contains RERA wording");
  check(home.overflowX === 0, `Live desktop overflow: ${home.overflowX}px`);
  check(home.stylesheets > 0, "Live site has no stylesheets");
  check(home.locationBadge.includes("SHREE JAGANNATH DHAM PURI"), "Live Puri location missing");
  check(home.locationBadge.includes("EKAMRA KHETRA BHUBANESWAR"), "Live Bhubaneswar location missing");

  await desktop.screenshot({ path: `${OUT}/01-home-desktop.png`, fullPage: false });

  await desktop.locator("#market-goal").selectOption("Rental Income");
  await desktop.waitForTimeout(400);
  const rentalCount = await desktop.locator("article[data-property-id]").count();
  check(rentalCount === 4, `Live Rental Income filter: ${rentalCount}, expected 4`);

  await desktop.getByRole("button", { name: "Waterfront", exact: true }).click();
  await desktop.waitForTimeout(400);
  const waterfrontCount = await desktop.locator("article[data-property-id]").count();
  check(waterfrontCount === 2, `Live Waterfront filter: ${waterfrontCount}, expected 2`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  mobile.setDefaultTimeout(20000);
  const mobileErrors = [];
  mobile.on("pageerror", (error) => mobileErrors.push(error.message));
  mobile.on("console", (msg) => {
    if (msg.type() === "error") mobileErrors.push(msg.text());
  });

  await mobile.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobile.waitForSelector("#home h1", { timeout: 20000 });
  await mobile.waitForTimeout(1500);

  const mobileHome = await mobile.evaluate(() => ({
    rootChildren: document.getElementById("root")?.children.length || 0,
    bodyTextLength: document.body.innerText.trim().length,
    cards: document.querySelectorAll("article[data-property-id]").length,
    locationBadge: document.querySelector('[data-edit-key="hero.eyebrow"]')?.innerText || "",
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  check(mobileHome.rootChildren > 0, "Live mobile root is empty");
  check(mobileHome.bodyTextLength > 200, "Live mobile body text missing");
  check(mobileHome.cards === 5, `Live mobile cards: ${mobileHome.cards}, expected 5`);
  check(mobileHome.overflowX === 0, `Live mobile overflow: ${mobileHome.overflowX}px`);
  check(mobileHome.locationBadge.includes("SHREE JAGANNATH DHAM PURI"), "Live mobile Puri location missing");
  check(mobileHome.locationBadge.includes("EKAMRA KHETRA BHUBANESWAR"), "Live mobile Bhubaneswar location missing");

  await mobile.screenshot({ path: `${OUT}/02-home-mobile.png`, fullPage: false });

  const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  product.setDefaultTimeout(20000);
  const productErrors = [];
  product.on("pageerror", (error) => productErrors.push(error.message));
  await product.addInitScript(() => {
    window.__lastWaUrl = null;
    window.open = (url) => {
      window.__lastWaUrl = url;
      return null;
    };
  });

  await product.goto(BASE + "/property/prop_103", { waitUntil: "domcontentloaded", timeout: 30000 });
  await product.waitForSelector("h1", { timeout: 20000 });
  await product.waitForTimeout(1200);

  const detail = await product.evaluate(() => ({
    heading: document.querySelector("h1")?.innerText.trim() || "",
    whatsappButton: Array.from(document.querySelectorAll("button")).some((button) =>
      /WhatsApp Inquiry/i.test(button.innerText),
    ),
    negotiationNotes: Array.from(document.querySelectorAll("p")).filter((p) =>
      p.textContent.includes("Guaranteed – Negotiation by contact"),
    ).length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  check(detail.heading.includes("Blu Marina"), "Live product heading missing");
  check(detail.whatsappButton, "Live product WhatsApp button missing");
  check(detail.negotiationNotes > 0, "Live product negotiation note missing");
  check(detail.overflowX === 0, `Live product overflow: ${detail.overflowX}px`);

  await product.locator('button:has-text("WhatsApp Inquiry")').first().click();
  await product.waitForSelector('[role="dialog"]');
  await product.fill("#wa-name", "Live Deploy Test");
  await product.fill("#wa-phone", "8917622925");
  await product.locator('button:has-text("Continue to WhatsApp")').click();
  await product.waitForTimeout(400);
  const waUrl = await product.evaluate(() => window.__lastWaUrl);
  const message = waUrl ? decodeURIComponent(waUrl.split("text=")[1]) : "";
  check(Boolean(waUrl && waUrl.startsWith("https://wa.me/918917622925?text=")), "Live WhatsApp URL wrong");
  check(message.includes("Name: Live Deploy Test"), "Live WhatsApp name missing");
  check(message.includes("Project: Blu Marina"), "Live WhatsApp project missing");

  await product.screenshot({ path: `${OUT}/03-product-desktop.png`, fullPage: false });

  const report = {
    base: BASE,
    status: failures.length === 0 ? "PASS" : "FAIL",
    failures,
    home,
    filters: { rentalCount, waterfrontCount },
    mobileHome,
    detail,
    whatsappUrl: waUrl,
    whatsappMessage: message,
    errors: { desktop: errors, mobile: mobileErrors, product: productErrors },
  };
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await browser.close();
  process.exit(failures.length === 0 ? 0 : 1);
})();
