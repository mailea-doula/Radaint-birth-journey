// Renders contract.html into the two PDFs.
//   node build.js   ->  dist/*-print.pdf, dist/.ipad-base.pdf + dist/.ipad-fields.json
// then: python3 add_fields.py  (adds the fillable fields to the iPad copy)
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync } = require("fs");
const { pathToFileURL } = require("url");
const path = require("path");

const here = __dirname;
const src = pathToFileURL(path.join(here, "contract.html")).href;
const out = path.join(here, "dist");
mkdirSync(out, { recursive: true });
const shots = process.env.SHOTS;

(async () => {
const browser = await chromium.launch();
for (const mode of ["print", "ipad"]) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await page.goto(`${src}?mode=${mode}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  // Fail loudly if any sheet's content runs into the footer.
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll(".page")].map((p, i) => {
      const foot = p.querySelector(".foot").getBoundingClientRect();
      const last = [...p.querySelector(".content").children].pop().getBoundingClientRect();
      return { page: i + 1, spare_mm: +((foot.top - last.bottom) * 0.264583).toFixed(1) };
    }));
  console.log(mode, JSON.stringify(overflow));
  if (shots) await page.screenshot({ path: `${shots}/${mode}.png`, fullPage: true });
  if (overflow.some(o => o.spare_mm < 1)) throw new Error("content overflows a page");

  if (mode === "ipad") {
    const fields = await page.evaluate(() => {
      const pages = [...document.querySelectorAll(".page")];
      return [...document.querySelectorAll("[data-field]")].map(el => {
        const pg = el.closest(".page"), pr = pg.getBoundingClientRect(), r = el.getBoundingClientRect();
        return { name: el.dataset.field, page: pages.indexOf(pg),
                 x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
      });
    });
    writeFileSync(path.join(out, ".ipad-fields.json"), JSON.stringify(fields, null, 1));
  }
  await page.pdf({
    path: path.join(out, mode === "print" ? "Radiant-Birth-Journey-Agreement-print.pdf" : ".ipad-base.pdf"),
    preferCSSPageSize: true, printBackground: true,
  });
  await page.close();
}
await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
