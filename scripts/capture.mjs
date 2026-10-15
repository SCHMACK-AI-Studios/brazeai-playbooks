/**
 * Screenshots every slide of a playbook, fully revealed, at 1920×1080, for
 * visual checking. Needs the app running (pnpm dev).
 *
 *   pnpm capture <playbook-id> [out-dir]
 *   pnpm capture agentic-standards captures/agentic-standards
 *
 * Set CHROME_PATH if Chrome is not in the default macOS location.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { BASE, launch, sleep } from "./cdp.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Usage: pnpm capture <playbook-id> [out-dir]");
  process.exit(2);
}
const out = process.argv[3] ?? `captures/${id}`;
mkdirSync(out, { recursive: true });

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
