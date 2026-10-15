/**
 * A minimal Chrome DevTools Protocol driver, with no npm dependencies:
 * launches headless Chrome, opens pages, evaluates, screenshots. Shared by
 * scripts/capture.mjs and scripts/user-stories.mjs. Adapted from the harness
 * in abridge-sessions' user-stories.mjs.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** The running app: the dev server (pnpm dev) or a preview of the build (pnpm preview). */
export const BASE = (process.env.BASE_URL ?? "http://localhost:5195").replace(/\/+$/, "");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// A fresh port per run, so a Chrome left behind by an interrupted run is never reused.
const PORT = Number(process.env.CDP_PORT ?? 9300 + Math.floor(Math.random() * 600));

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "schmack-playbooks-"));
  const chrome = spawn(
    CHROME,
    [
      process.env.CDP_HEADLESS === "old" ? "--headless=old" : "--headless=new",
      "--disable-gpu",
      // Needed when Chrome runs as root, as it does in a container.
      ...(process.env.CHROME_NO_SANDBOX ? ["--no-sandbox"] : []),
      "--hide-scrollbars",
      // Several windows are driven at once (audience and presenter). Without
      // these, Chrome pauses animation frames in every tab but the front one,
      // and motion in the others freezes mid-transition.
      "--disable-renderer-backgrounding",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--force-device-scale-factor=1",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--window-size=1920,1080",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const close = () => {
    chrome.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  };
  process.on("exit", close);
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/version`);
      break;
    } catch {
      await sleep(100);
    }
  }
  try {
    await fetch(BASE);
  } catch {
    console.error(`No dev server at ${BASE}. Start one with \`pnpm dev\` first.`);
    process.exit(2);
  }
  return { newPage, close };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Each page gets its own window, as the projector and presenter windows do in
 * the room. Pages opened as tabs of one window steal visibility from each
 * other on every synthetic key press, and a hidden tab pauses its animation
 * frames, which freezes every transition mid-flight and fails good code.
 */
let browser = null;
async function browserSession() {
  if (browser) return browser;
  const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  browser = new Page(ws, "browser");
  // The about:blank tab Chrome starts with would otherwise share a window with the first page.
  for (const t of await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()) {
    if (t.type === "page") await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`).catch(() => {});
  }
  return browser;
}

async function newPage() {
  const b = await browserSession();
  const { targetId } = await b.send("Target.createTarget", { url: "about:blank", newWindow: true });
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const page = new Page(ws, targetId);
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  return page;
}

export class Page {
  static active = null;
  constructor(ws, id) {
    this.ws = ws;
    this.targetId = id;
    this.id = 0;
    this.pending = new Map();
    this.errors = [];
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        this.pending.get(m.id)(m);
        this.pending.delete(m.id);
      }
      if (m.method === "Runtime.exceptionThrown")
        this.errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
      if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning"))
        this.errors.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(" ")}`);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${JSON.stringify(m.error)}`)) : res(m.result)));
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", {
      expression: `(async()=>{${expr}})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  }
  async size(width, height) {
    await this.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  }
  async goto(url, settle = 1500) {
    await this.send("Page.navigate", { url });
    await this.eval(
      `await new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r)); return 1;`,
    );
    await sleep(settle);
  }
  async key(key, code, keyCode) {
    // A key sent to a window that is not the active one is dropped by Chrome,
    // as a real keyboard's would be. Activate it first, like clicking into it.
    if (Page.active !== this) {
      await this.send("Page.bringToFront");
      Page.active = this;
    }
    for (const type of ["keyDown", "keyUp"]) {
      const sent = this.send("Input.dispatchKeyEvent", {
        type,
        key,
        code,
        windowsVirtualKeyCode: keyCode,
        nativeVirtualKeyCode: keyCode,
      });
      // Never let one unacknowledged key hang the whole run; the checks say what went wrong.
      const r = await Promise.race([sent, sleep(4000).then(() => "timeout")]);
      if (r === "timeout") this.errors.push(`harness: ${type} ${key} not acknowledged in 4s`);
    }
  }
  async click(x, y) {
    for (const type of ["mousePressed", "mouseReleased"])
      await this.send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
  async screenshot() {
    const r = await this.send("Page.captureScreenshot", { format: "png" });
    return Buffer.from(r.data, "base64");
  }
}
