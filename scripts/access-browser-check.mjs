/** Exercises the production builds in Chrome; redemption is faked only in this test process. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { createApp } from "../server/app.mjs";
import { loadConfig } from "../server/config.mjs";

const website = createServer((_req, res) => res.end("Resource form"));
website.listen(0, "127.0.0.1");
await once(website, "listening");
const websiteOrigin = `http://127.0.0.1:${website.address().port}`;
const config = loadConfig({
  NODE_ENV: "development",
  PUBLIC_ORIGIN: "http://127.0.0.1:5195",
  WEBSITE_ORIGIN: websiteOrigin,
  PLAYBOOK_SESSION_SECRET: "browser-test-secret-of-at-least-32-bytes",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "unused-test-key",
});
const code = "b".repeat(43);
const consumed = new Set();
const server = createApp(config, {
  redeem: async (id, value) => {
    if (value !== code || consumed.has(id)) return null;
    consumed.add(id);
    return Date.now() + 60_000;
  },
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
process.env.BASE_URL = base;
const { launch, sleep } = await import("./cdp.mjs");
const { newPage, close } = await launch();
try {
  const page = await newPage();
  await page.size(1440, 900);
  await page.goto(`${base}/decisioning-studio-go/4`);
  assert.equal(await page.eval("return location.origin"), websiteOrigin);
  for (const [id, total] of [
    ["decisioning-studio-go", 17],
    ["agentic-standards", 19],
    ["conversational-agents", 18],
  ]) {
    await page.goto(`${base}/access/${id}?code=${code}`);
    assert.equal(await page.eval("return location.search"), "");
    assert.equal(await page.eval("return window.__deck.total"), total);
    assert.equal(await page.eval("return document.cookie.includes('schmack_playbook')"), false);
    await page.key("ArrowRight", "ArrowRight", 39);
    await sleep(100);
    assert.equal(await page.eval("return location.pathname"), `/${id}/2`);
    await page.send("Page.reload");
    await sleep(1200);
    assert.equal(await page.eval("return window.__deck.getSnapshot().slide"), 1);
    assert.equal(
      await page.eval("return [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length"),
      0,
    );
    assert.equal(
      await page.eval("return document.querySelector('nav a').href"),
      "https://schmack.com/?folder=resources",
    );
    console.log(`${id}: protected production reader rendered, navigation and refresh passed`);
  }
  await page.send("Network.clearBrowserCookies");
  await page.goto(`${base}/decisioning-studio-go/2`);
  assert.equal(await page.eval("return location.origin"), websiteOrigin, "Copied URL must require a grant");
  assert.deepEqual(page.errors, []);
} finally {
  close();
  await new Promise((resolve) => server.close(resolve));
  await new Promise((resolve) => website.close(resolve));
}
process.exit(0);
