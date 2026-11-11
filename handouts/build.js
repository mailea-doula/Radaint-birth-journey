// Renders brain-handout.html to an A4 PDF:  node build.js
const { chromium } = require("playwright");
const { pathToFileURL } = require("url");
const path = require("path");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto(pathToFileURL(path.join(__dirname, "brain-handout.html")).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").length);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log("fonts loaded:", fonts, "scrollHeight:", h);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT, fullPage: true });
  await page.pdf({ path: path.join(__dirname, "Radiant-Birth-Journey-BRAIN-handout.pdf"), preferCSSPageSize: true, printBackground: true });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
