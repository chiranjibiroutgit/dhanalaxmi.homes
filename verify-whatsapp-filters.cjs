const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5174";
const OUT = "verification/whatsapp-filters";

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  /* Capture the WhatsApp URL instead of really opening a tab */
  await page.addInitScript(() => {
    window.__lastWaUrl = null;
    window.open = (url) => {
      window.__lastWaUrl = url;
      return null;
    };
  });

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const home = await page.evaluate(() => ({
    cards: document.querySelectorAll("article[data-property-id]").length,
    priceNotes: Array.from(document.querySelectorAll("p")).filter((p) =>
      p.textContent.includes("Guaranteed – Negotiation by contact"),
    ).length,
    hasGoal: !!document.querySelector("#market-goal"),
    hasTier: !!document.querySelector("#market-tier"),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rera: /RERA/i.test(document.body.innerText),
  }));
  const homeText = await page.locator("body").innerText();
  const homeHasSiteVisit = /Book a Site Visit/i.test(homeText);

  await page.screenshot({ path: `${OUT}/01-home-desktop.png`, fullPage: true });

  /* Goal filter */
  await page.locator("#market-goal").selectOption("Rental Income");
  await page.waitForTimeout(450);
  const rentalCount = await page.locator("article[data-property-id]").count();

  /* Quick pick — Waterfront */
  await page.getByRole("button", { name: "Waterfront", exact: true }).click();
  await page.waitForTimeout(450);
  const waterfrontCount = await page.locator("article[data-property-id]").count();
  const waterfrontTitles = await page
    .locator("article[data-property-id] h3")
    .allInnerTexts();

  await page.screenshot({ path: `${OUT}/02-home-filtered.png`, fullPage: true });

  /* Clear filters */
  await page.getByRole("button", { name: /Clear filters/i }).click();
  await page.waitForTimeout(450);
  const resetCount = await page.locator("article[data-property-id]").count();

  /* About CTA — general WhatsApp enquiry (no site-visit fields on home) */
  await page.locator("#about").getByRole("button", { name: /Chat on WhatsApp/i }).click();
  await page.waitForTimeout(250);
  const aboutModalOpen = await page.getByRole("dialog").isVisible();
  const aboutDateFields = await page.locator("#wa-date").count();
  await page.getByRole("button", { name: /Close WhatsApp form/i }).click();
  await page.waitForTimeout(200);

  /* Product page — WhatsApp inquiry */
  await page.goto(BASE + "/property/prop_103", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: /WhatsApp Inquiry/i }).first().click();
  await page.waitForTimeout(250);
  const inquiryModalOpen = await page.getByRole("dialog").isVisible();
  const inquiryDateFields = await page.locator("#wa-date").count();
  await page.fill("#wa-name", "Test Client");
  await page.fill("#wa-phone", "9876543210");
  await page.getByRole("button", { name: /Continue to WhatsApp/i }).click();
  await page.waitForTimeout(350);

  const inquiryUrl = await page.evaluate(() => window.__lastWaUrl);
  const inquiryMessage = inquiryUrl ? decodeURIComponent(inquiryUrl.split("text=")[1]) : "";

  /* Product page — site visit */
  await page.getByRole("button", { name: /Book a Site Visit/i }).first().click();
  await page.waitForTimeout(250);
  const visitModalOpen = await page.getByRole("dialog").isVisible();
  const visitDateFields = await page.locator("#wa-date").count();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.fill("#wa-name", "Visit Client");
  await page.fill("#wa-phone", "8917622925");
  await page.fill("#wa-date", nextWeek);
  await page.selectOption("#wa-time", "1:00 PM");
  await page.getByRole("button", { name: /Continue to WhatsApp/i }).click();
  await page.waitForTimeout(350);

  const visitUrl = await page.evaluate(() => window.__lastWaUrl);
  const visitMessage = visitUrl ? decodeURIComponent(visitUrl.split("text=")[1]) : "";

  const savedLeads = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("dl_whatsapp_leads") || "[]");
    } catch {
      return [];
    }
  });

  await page.screenshot({ path: `${OUT}/03-product-desktop.png`, fullPage: true });

  /* Mobile checks */
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mobileErrors = [];
  mobile.on("pageerror", (err) => mobileErrors.push(err.message));

  await mobile.goto(BASE + "/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(900);
  const mobileHome = await mobile.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cards: document.querySelectorAll("article[data-property-id]").length,
    notes: Array.from(document.querySelectorAll("p")).filter((p) =>
      p.textContent.includes("Guaranteed – Negotiation by contact"),
    ).length,
  }));
  await mobile.screenshot({ path: `${OUT}/04-home-mobile.png`, fullPage: true });

  await mobile.goto(BASE + "/property/prop_103", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(900);
  await mobile.getByRole("button", { name: /Site Visit/i }).first().click();
  await mobile.waitForTimeout(300);
  const modalBox = await mobile.getByRole("dialog").boundingBox();
  const mobileModal = await mobile.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    modalVisible: !!document.querySelector('[role="dialog"]'),
  }));
  await mobile.screenshot({ path: `${OUT}/05-visit-modal-mobile.png`, fullPage: false });

  /* Mobile menu WhatsApp + call side by side */
  await mobile.goto(BASE + "/", { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: /Open menu/i }).click();
  await mobile.waitForTimeout(400);
  const mobileMenu = await mobile.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasCall: text.includes("Call Sales"),
      hasWhatsApp: text.includes("WhatsApp"),
    };
  });
  await mobile.screenshot({ path: `${OUT}/06-mobile-menu.png`, fullPage: false });

  console.log(
    JSON.stringify(
      {
        home,
        homeHasSiteVisit,
        filters: { rentalCount, waterfrontCount, waterfrontTitles, resetCount },
        about: { modalOpen: aboutModalOpen, dateFields: aboutDateFields },
        inquiry: {
          modalOpen: inquiryModalOpen,
          dateFields: inquiryDateFields,
          url: inquiryUrl,
          message: inquiryMessage,
          correctNumber: Boolean(inquiryUrl && inquiryUrl.startsWith("https://wa.me/918917622925?text=")),
          hasName: inquiryMessage.includes("Name: Test Client"),
          hasPhone: inquiryMessage.includes("Mobile: +91 9876543210"),
          hasProject: inquiryMessage.includes("Project: Blu Marina"),
          hasReference: /Reference: DL-[A-Z0-9]+/.test(inquiryMessage),
        },
        visit: {
          modalOpen: visitModalOpen,
          dateFields: visitDateFields,
          url: visitUrl,
          message: visitMessage,
          correctNumber: Boolean(visitUrl && visitUrl.startsWith("https://wa.me/918917622925?text=")),
          hasName: visitMessage.includes("Name: Visit Client"),
          hasPhone: visitMessage.includes("Mobile: +91 8917622925"),
          hasProject: visitMessage.includes("Project: Blu Marina"),
          hasDate: visitMessage.includes(`Preferred date: ${nextWeek}`),
          hasTime: visitMessage.includes("Preferred time: 1:00 PM"),
        },
        savedLeads: savedLeads.length,
        mobileHome,
        mobileModal,
        modalBox,
        mobileMenu,
        consoleErrors,
        pageErrors,
        mobileErrors,
      },
      null,
      2,
    ),
  );

  await browser.close();
})();
