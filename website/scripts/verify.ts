import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DEPLOY_INFO = join(ROOT, "deploy-info.json");

const url: string | undefined =
  process.env.SITE_URL ??
  (existsSync(DEPLOY_INFO)
    ? (JSON.parse(readFileSync(DEPLOY_INFO, "utf8")) as { url?: string }).url
    : undefined);

if (!url) {
  console.error(
    "No site URL. Set SITE_URL env var or run deployment first (deploy-info.json)."
  );
  process.exit(1);
}

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function checkImageLoaded(
  page: import("playwright").Page,
  selector: string
): Promise<boolean> {
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0) return false;
  return loc.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
}

const SHOW_PAGES = [
  { path: "/shows/ima", title: "אין לי אמא אחרת" },
  { path: "/shows/hitnaari", title: "התנערי" },
  { path: "/shows/isha", title: "אשה עניין של גישה" },
];

async function main() {
  console.log(`Verifying site at ${url}\n`);
  const browser = await chromium.launch();

  // ---------- Desktop ----------
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  console.log("[1] Homepage");
  const homeResp = await page.goto(url, { waitUntil: "networkidle" });
  check("homepage returns 200", homeResp?.status() === 200);
  check(
    "document title contains theater name",
    (await page.title()).includes("תיאטרון התנערי"),
    await page.title()
  );
  check(
    "html dir is rtl",
    (await page.locator("html").getAttribute("dir")) === "rtl"
  );
  check(
    "html lang is he",
    (await page.locator("html").getAttribute("lang")) === "he"
  );
  check(
    "hero h1 shows theater name",
    (await page.locator("h1").first().textContent())?.includes("תיאטרון התנערי") ?? false
  );
  check("three show cards on homepage", (await page.locator(".show-card").count()) === 3);
  check(
    "whatsapp links present",
    (await page.locator('a[href*="wa.me"]').count()) >= 3
  );
  const waHref = await page.locator('a[href*="wa.me"]').first().getAttribute("href");
  check(
    "whatsapp links use 972546588573",
    waHref?.includes("972546588573") ?? false,
    waHref ?? "none"
  );
  check(
    "whatsapp link carries prefilled text",
    waHref?.includes("text=") ?? false
  );
  check(
    "email mailto link exists",
    (await page.locator('a[href="mailto:hodayakors@gmail.com"]').count()) >= 1
  );
  check(
    "facebook link exists",
    (await page.locator('a[href*="facebook.com"]').count()) >= 1
  );
  check(
    "floating whatsapp button exists",
    (await page.locator(".floating-whatsapp").count()) === 1
  );
  check(
    "homepage gallery image loads",
    await checkImageLoaded(page, ".about-gallery img")
  );

  console.log("\n[2] Show pages (client-side navigation)");
  for (const s of SHOW_PAGES) {
    await page.click(`.main-nav a[href="${s.path}"]`);
    await page.waitForLoadState("networkidle");
    check(
      `${s.path} — h1 is "${s.title}"`,
      (await page.locator("h1").first().textContent())?.trim() === s.title,
      (await page.locator("h1").first().textContent())?.trim() ?? "none"
    );
  }

  console.log("\n[3] Direct URL loads (SPA fallback via Lambda)");
  for (const s of SHOW_PAGES) {
    const resp = await page.goto(`${url}${s.path}`, { waitUntil: "networkidle" });
    check(`${s.path} direct load returns 200`, resp?.status() === 200);
    check(
      `${s.path} direct load renders h1`,
      (await page.locator("h1").first().textContent())?.trim() === s.title
    );
    check(
      `${s.path} flyer image loads`,
      await checkImageLoaded(page, ".flyer-thumb img")
    );
  }

  console.log("\n[4] Media & assets");
  const assetResp = await page.request.get(url);
  check("root returns html content-type", (assetResp.headers()["content-type"] ?? "").includes("text/html"));
  const jsFile = (await page.evaluate(() => {
    const s = document.querySelector('script[src*="/assets/"]') as HTMLScriptElement | null;
    return s?.getAttribute("src") ?? "";
  })) || "";
  check("hashed js asset found", jsFile.length > 0, jsFile);
  if (jsFile) {
    const jsResp = await page.request.get(new URL(jsFile, url).toString());
    check("js asset returns 200", jsResp.status() === 200);
    const cache = jsResp.headers()["cache-control"] ?? "";
    check("js asset has immutable cache header", cache.includes("max-age=31536000"));
  }
  const videoCount = await page.evaluate(() => document.querySelectorAll("video").length);
  console.log(`  ℹ️ ${videoCount} videos embedded across pages`);
  const missingResp = await page.request.get(`${url}/definitely-missing.png`);
  check("missing static asset returns 404", missingResp.status() === 404);
  const fallbackResp = await page.request.get(`${url}/some/spa/route`);
  check(
    "unknown SPA route falls back to app shell (200 + html)",
    fallbackResp.status() === 200 &&
      (fallbackResp.headers()["content-type"] ?? "").includes("text/html")
  );
  check(
    "security header x-content-type-options set",
    homeResp?.headers()["x-content-type-options"] === "nosniff"
  );

  console.log("\n[5] Mobile layout");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: "networkidle" });
  check("hamburger visible on mobile", await page.locator(".nav-toggle").isVisible());
  await page.click(".nav-toggle");
  check("mobile menu opens", (await page.locator(".main-nav.open").count()) === 1);
  await page.click('.main-nav a[href="/shows/ima"]');
  await page.waitForLoadState("networkidle");
  check(
    "navigate via mobile menu works",
    (await page.locator("h1").first().textContent())?.trim() === "אין לי אמא אחרת"
  );

  console.log("\n[6] Console errors");
  check("no console/page errors", consoleErrors.length === 0, consoleErrors.join(" | "));

  await browser.close();

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failed checks:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Verification crashed:", e);
  process.exit(1);
});
