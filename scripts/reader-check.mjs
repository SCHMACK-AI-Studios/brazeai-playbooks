/** Browser regression checks. Run with `node scripts/reader-check.mjs` and pnpm dev running. */
import assert from "node:assert/strict";
import { BASE, launch, sleep } from "./cdp.mjs";

const { newPage, close } = await launch();
try {
  const first = await newPage();
  const second = await newPage();
  const position = (page) => page.eval("return window.__deck.getSnapshot().slide");
  await first.goto(`${BASE}/decisioning-studio-go/4?presenter`);
  assert.equal(await position(first), 3);
  assert.equal(await first.eval("return location.search"), "");
  assert.equal(await first.eval("return !!document.querySelector('nav[aria-label=\"Playbook navigation\"]')"), true);

  await second.goto(`${BASE}/decisioning-studio-go/1`);
  await first.key("ArrowRight", "ArrowRight", 39);
  await sleep(100);
  assert.equal(await position(first), 4);
  assert.equal(await position(second), 0, "Tabs must navigate independently");
  await first.send("Page.reload");
  await sleep(1200);
  assert.equal(await position(first), 4, "Refresh must preserve the URL position");

  for (const [key, code, number] of [
    [" ", "Space", 32],
    ["PageDown", "PageDown", 34],
    ["PageUp", "PageUp", 33],
    ["Home", "Home", 36],
    ["End", "End", 35],
    ["ArrowUp", "ArrowUp", 38],
    ["ArrowDown", "ArrowDown", 40],
    ["f", "KeyF", 70],
    ["p", "KeyP", 80],
    ["h", "KeyH", 72],
    ["1", "Digit1", 49],
    ["Enter", "Enter", 13],
  ])
    await first.key(key, code, number);
  assert.equal(await position(first), 4, "Removed shortcuts must not navigate");
  assert.equal(await first.eval("return document.fullscreenElement === null"), true);
  await first.eval("document.querySelector('[data-slide]').click()");
  assert.equal(await position(first), 4, "Clicking content must not advance");

  await first.eval(`
    const input = document.createElement('input');
    document.body.append(input); input.focus();
  `);
  await first.key("ArrowRight", "ArrowRight", 39);
  assert.equal(await position(first), 4, "Typing fields must retain arrow keys");
  await first.eval(
    "document.querySelector('input').remove(); document.querySelector('[aria-label=\"Next slide\"]').focus()",
  );
  await first.key("Enter", "Enter", 13);
  await first.send("Input.dispatchKeyEvent", {
    type: "char",
    text: "\r",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await sleep(100);
  assert.equal(await position(first), 5, "Enter must activate focused controls normally");
  await first.key("ArrowLeft", "ArrowLeft", 37);
  await sleep(100);
  assert.equal(await position(first), 4);

  await first.size(320, 812);
  await sleep(2800);
  assert.equal(
    await first.eval(`
    const nav = document.querySelector('nav');
    const rect = nav.getBoundingClientRect();
    return getComputedStyle(nav).opacity === '1' && rect.left >= 0 && rect.right <= innerWidth;
  `),
    true,
    "Navigation must stay visible and fit a narrow screen",
  );

  for (const id of ["decisioning-studio-go", "agentic-standards", "conversational-agents"]) {
    await first.goto(`${BASE}/${id}/1`);
    const total = await first.eval("return window.__deck.total");
    await first.key("ArrowLeft", "ArrowLeft", 37);
    assert.equal(await position(first), 0);
    for (let slide = 0; slide < total; slide++) {
      await first.eval(`window.__deck.goTo(${slide})`);
      await sleep(50);
      assert.equal(
        await first.eval(
          "return document.querySelector('main').getAttribute('aria-label').startsWith('Slide ' + (window.__deck.getSnapshot().slide + 1) + ' of ')",
        ),
        true,
      );
    }
    await first.key("ArrowRight", "ArrowRight", 39);
    assert.equal(await position(first), total - 1);
    console.log(`${id}: ${total} slides rendered, navigation boundaries passed`);
  }
  await first.goto(`${BASE}/decisioning-studio-go/presenter`);
  assert.equal(await position(first), 0, "Legacy presenter URLs should open the reader");
  assert.equal(await first.eval("return location.pathname.endsWith('/1')"), true);
  assert.deepEqual(first.errors, []);
  assert.deepEqual(second.errors, []);
  console.log("Reader checks passed: independent tabs, refresh, shortcuts, controls, mobile width and legacy URLs.");
} finally {
  close();
}
process.exit(0);
