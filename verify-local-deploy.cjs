const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:4173";
const OUT = "verification/local-deploy";

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  /* ── Desktop production page ───────────────────────────────────────────── */
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const desktopErrors = [];
  const desktopFailures = [];
  desktop.on("console", (msg) => {
    if (msg.type() === "error") desktopErrors.push(msg.text());
  });
  desktop.on("pageerror", (error) => desktopErrors.push(error.message));
  desktop.on("requestfailed", (request) => {
    if (request.url().startsWith(BASE)) {
      desktopFailures.push(`${request.url()} — ${request.failure()?.errorText || "failed"}`);
    }
  });

  await desktop.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
  await desktop.waitForSelector("#home h1", { timeout: 15000 });
  await desktop.waitForTimeout(1000);

  const home = await desktop.evaluate(() => {
    const root = document.getElementById("root");
    const hero = document.querySelector("#home");
    return {
      rootChildren: root ? root.children.length : 0,
      bodyTextLength: document.body.innerText.trim().length,
      bodyTextStart: document.body.innerText.trim().slice(0, 120),
      heroHeading: document.querySelector("#home h1")?.innerText.trim() || "",
      headerBrand: document.querySelector("header")?.innerText.includes("DHANALAXMI") || false,
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
      headerBackground: getComputedStyle(document.querySelector("header")).backgroundColor,
    };
  });

  check(home.rootChildren > 0, "React root is empty (black/blank screen)");
  check(home.bodyTextLength > 200, "Page body has almost no text (black/blank screen)");
  check(home.heroHeading.includes("Modern Living"), "Hero headline missing");
  check(home.headerBrand, "Header brand missing");
  check(home.cards === 5, `Expected 5 property cards, found ${home.cards}`);
  check(home.hasSearch, "Search/filter form missing");
  check(home.hasGoalFilter, "Goal filter missing");
  check(home.negotiationNotes > 0, "Negotiation note missing");
  check(!home.rera, "RERA wording still present");
  check(home.overflowX === 0, `Desktop horizontal overflow: ${home.overflowX}px`);
  check(home.stylesheets > 0, "No stylesheets loaded");
  check(home.locationBadge.includes("SHREE JAGANNATH DHAM PURI"), "Puri location missing");
  check(home.locationBadge.includes("EKAMRA KHETRA BHUBANESWAR"), "Bhubaneswar location missing");

  /* Filter behaviour on the production build */
  await desktop.screenshot({ path: `${OUT}/01-home-desktop.png`, fullPage: false });
  await desktop.screenshot({ path: `${OUT}/02-home-desktop-full.png`, fullPage: true });

  await desktop.locator("#market-goal").selectOption("Rental Income");
  await desktop.waitForTimeout(350);
  const rentalCount = await desktop.locator("article[data-property-id]").count();
  check(rentalCount === 4, `Rental Income filter returned ${rentalCount}, expected 4`);

  await desktop.getByRole("button", { name: "Waterfront", exact: true }).click();
  await desktop.waitForTimeout(350);
  const waterfrontCount = await desktop.locator("article[data-property-id]").count();
  check(waterfrontCount === 2, `Waterfront filter returned ${waterfrontCount}, expected 2`);

  /* ── Product page + WhatsApp lead capture ─────────────────────────────── */
  const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  product.setDefaultTimeout(12000);
  const productErrors = [];
  product.on("pageerror", (error) => productErrors.push(error.message));
  await product.addInitScript(() => {
    window.__lastWaUrl = null;
    window.open = (url) => {
      window.__lastWaUrl = url;
      return null;
    };
  });

  await product.goto(BASE + "/property/prop_103", { waitUntil: "domcontentloaded", timeout: 20000 });
  await product.waitForSelector("h1", { timeout: 15000 });
  await product.waitForTimeout(800);

  const detail = await product.evaluate(() => ({
    heading: document.querySelector("h1")?.innerText.trim() || "",
    whatsappButton: Array.from(document.querySelectorAll("button")).some((button) =>
      /WhatsApp Inquiry/i.test(button.innerText),
    ),
    callLink: Array.from(document.querySelectorAll("a")).some((link) =>
      (link.getAttribute("href") || "").startsWith("tel:+918917622925"),
    ),
    negotiationNotes: Array.from(document.querySelectorAll("p")).filter((p) =>
      p.textContent.includes("Guaranteed – Negotiation by contact"),
    ).length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rera: /RERA/i.test(document.body.innerText),
  }));
  check(detail.heading.includes("Blu Marina"), "Product page heading missing");
  check(detail.whatsappButton, "Product WhatsApp button missing");
  check(detail.callLink, "Product call link missing");
  check(detail.negotiationNotes > 0, "Product negotiation note missing");
  check(detail.overflowX === 0, `Product desktop overflow: ${detail.overflowX}px`);
  check(!detail.rera, "Product page contains RERA wording");

  await product.locator('button:has-text("WhatsApp Inquiry")').first().click();
  await product.waitForSelector('[role="dialog"]');
  await product.fill("#wa-name", "Local Deploy Test");
  await product.fill("#wa-phone", "8917622925");
  await product.locator('button:has-text("Continue to WhatsApp")').click();
  await product.waitForTimeout(350);
  const inquiryUrl = await product.evaluate(() => window.__lastWaUrl);
  const inquiryMessage = inquiryUrl ? decodeURIComponent(inquiryUrl.split("text=")[1]) : "";
  check(
    Boolean(inquiryUrl && inquiryUrl.startsWith("https://wa.me/918917622925?text=")),
    "Product WhatsApp URL is wrong",
  );
  check(inquiryMessage.includes("Name: Local Deploy Test"), "Product WhatsApp message missing name");
  check(inquiryMessage.includes("Project: Blu Marina"), "Product WhatsApp message missing project");
  await product.screenshot({ path: `${OUT}/03-product-desktop.png`, fullPage: false });

  /* ── Mobile production page ───────────────────────────────────────────── */
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mobileErrors = [];
  mobile.on("pageerror", (error) => mobileErrors.push(error.message));
  mobile.on("console", (msg) => {
    if (msg.type() === "error") mobileErrors.push(msg.text());
  });

  await mobile.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 20000 });
  await mobile.waitForSelector("#home h1", { timeout: 15000 });
  await mobile.waitForTimeout(1000);

  const mobileHome = await mobile.evaluate(() => ({
    rootChildren: document.getElementById("root")?.children.length || 0,
    bodyTextLength: document.body.innerText.trim().length,
    cards: document.querySelectorAll("article[data-property-id]").length,
    locationBadge: document.querySelector('[data-edit-key="hero.eyebrow"]')?.innerText || "",
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fabVisible: Boolean(document.querySelector('button[aria-label*="WhatsApp"]')),
  }));
  check(mobileHome.rootChildren > 0, "Mobile root is empty (black/blank screen)");
  check(mobileHome.bodyTextLength > 200, "Mobile page has almost no text");
  check(mobileHome.cards === 5, `Mobile cards: ${mobileHome.cards}, expected 5`);
  check(mobileHome.overflowX === 0, `Mobile horizontal overflow: ${mobileHome.overflowX}px`);
  check(mobileHome.locationBadge.includes("SHREE JAGANNATH DHAM PURI"), "Mobile Puri location missing");
  check(mobileHome.locationBadge.includes("EKAMRA KHETRA BHUBANESWAR"), "Mobile Bhubaneswar location missing");

  await mobile.screenshot({ path: `${OUT}/04-home-mobile.png`, fullPage: false });
  await mobile.screenshot({ path: `${OUT}/05-home-mobile-full.png`, fullPage: true });

  /* Mobile product and visit form */
  await mobile.goto(BASE + "/property/prop_103", { waitUntil: "domcontentloaded", timeout: 20000 });
  await mobile.waitForSelector("h1", { timeout: 15000 });
  await mobile.waitForTimeout(800);
  const mobileDetail = await mobile.evaluate(() => ({
    heading: document.querySelector("h1")?.innerText.trim() || "",
    visitButton: Array.from(document.querySelectorAll("button")).some(
      (button) =>
        button.innerText.trim().toLowerCase() === "site visit" && button.offsetParent !== null,
    ),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  check(mobileDetail.heading.includes("Blu Marina"), "Mobile product heading missing");
  check(mobileDetail.visitButton, "Mobile site-visit button missing");
  check(mobileDetail.overflowX === 0, `Mobile product overflow: ${mobileDetail.overflowX}px`);

  await mobile.getByRole("button", { name: "Site Visit", exact: true }).click();
  await mobile.waitForSelector('[role="dialog"]');
  check((await mobile.locator("#wa-date").count()) === 1, "Visit form date field missing");
  await mobile.screenshot({ path: `${OUT}/06-visit-modal-mobile.png`, fullPage: false });

  /* ── Report ───────────────────────────────────────────────────────────── */
  const report = {
    base: BASE,
    status: failures.length === 0 ? "PASS" : "FAIL",
    failures,
    desktop: {
      home,
      rentalCount,
      waterfrontCount,
      consoleErrors: desktopErrors,
      localRequestFailures: desktopFailures,
    },
    product: {
      detail,
      whatsappUrl: inquiryUrl,
      message: inquiryMessage,
      pageErrors: productErrors,
    },
    mobile: {
      home: mobileHome,
      detail: mobileDetail,
      errors: mobileErrors,
    },
  };

  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await browser.close();
  process.exit(failures.length === 0 ? 0 : 1);
})();
