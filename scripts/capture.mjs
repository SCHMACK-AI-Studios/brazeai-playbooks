/**
 * Screenshots every slide of a playbook, fully revealed, at 1920×1080, for
 * visual checking. Needs the app running (pnpm dev).
 *
 *   pnpm capture <playbook-id> [out-dir]
 *   pnpm capture agentic-standards captures/agentic-standards
 *   pnpm capture decisioning-studio-go --cover path/to/thumbnail.png
 *
 * Set CHROME_PATH if Chrome is not in the default macOS location.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { BASE, launch, sleep } from "./cdp.mjs";

const args = process.argv.slice(2);
const cover = args.includes("--cover");
const [id, destination] = args.filter((arg) => arg !== "--cover");
if (!id) {
  console.error("Usage: pnpm capture <playbook-id> [out-dir] | <playbook-id> --cover [output.png]");
  process.exit(2);
}
const out = destination ?? (cover ? `captures/${id}/cover.png` : `captures/${id}`);
mkdirSync(cover ? dirname(out) : out, { recursive: true });

const { newPage, close } = await launch();
const page = await newPage();
await page.size(1920, 1080);
await page.goto(`${BASE}/${id}/1`, 2000);
const total = await page.eval("return window.__deck?.total ?? 0");
if (!total) {
  console.error(`No playbook called "${id}" at ${BASE}.`);
  close();
  process.exit(2);
}

if (cover) {
  // Export the full slide canvas, without reader controls or letterboxing.
  await page.eval(`
    const main = document.querySelector('main');
    for (const control of main.querySelectorAll(':scope > nav, :scope > button')) control.style.display = 'none';
    main.firstElementChild.style.bottom = '0px';
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  `);
  await sleep(3200);
  writeFileSync(out, await page.screenshot());
  console.log(`Cover saved to ${out}`);
} else
  for (let n = 1; n <= total; n++) {
    await page.eval(`window.__deck.goTo(${n - 1}); return 1;`);
    await sleep(3200);
    writeFileSync(`${out}/s-${String(n).padStart(2, "0")}.png`, await page.screenshot());
    process.stdout.write(`${n} `);
  }
console.log();
if (page.errors.length) console.log(`ERRORS:\n${[...new Set(page.errors)].join("\n")}`);
close();
process.exit(0);
