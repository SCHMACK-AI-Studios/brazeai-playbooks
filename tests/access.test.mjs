import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createApp } from "../server/app.mjs";
import { cookieName, redeemCode, signGrant, verifyGrant } from "../server/access.mjs";
import { loadConfig } from "../server/config.mjs";

const config = loadConfig({
  PLAYBOOK_SESSION_SECRET: "test-secret-with-more-than-thirty-two-bytes",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
});
const id = "decisioning-studio-go";
const code = "a".repeat(43);
let server;
let base;
let remaining = true;
let outage = false;
let calls = 0;
let asset;
let stylesheet;
let font;
const request = (route, cookie, method = "GET") =>
  fetch(`${base}${route}`, {
    method,
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  });
const cookie = (deck = id, exp = Date.now() + 60_000) =>
  `${cookieName(deck, true)}=${signGrant(deck, exp, config.secret)}`;

before(async () => {
  const assets = await readdir(path.join(config.dist, id, "assets"));
  asset = assets.find((name) => name.endsWith(".js"));
  stylesheet = assets.find((name) => name.endsWith(".css"));
  font = assets.find((name) => name.endsWith(".woff2"));
  assert.ok(asset, "Run pnpm build before these tests");
  server = createApp(config, {
    redeem: async (deck, value) => {
      calls++;
      if (outage) throw new Error("Database unavailable");
      if (!remaining || deck !== id || value !== code) return null;
      remaining = false;
      return Date.now() + 60_000;
    },
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test("direct slides, index, JS, CSS, fonts, images and HEAD require access", async () => {
  for (const route of [
    `/${id}/4`,
    `/${id}/index.html`,
    `/${id}/assets/${asset}`,
    `/${id}/assets/${stylesheet}`,
    `/${id}/assets/${font}`,
    `/${id}/images/bg-cat.webp`,
  ]) {
    for (const method of ["GET", "HEAD"]) {
      const res = await request(route, undefined, method);
      assert.equal(res.status, 303);
      assert.equal(res.headers.get("location"), `https://schmack.com/?folder=resources&resource=${id}`);
      assert.match(res.headers.get("cache-control"), /no-store/);
      assert.match(res.headers.get("x-robots-tag"), /noindex/);
    }
  }
});

test("valid grant serves the actual build but never another playbook", async () => {
  const grant = cookie();
  const html = await request(`/${id}/4`, grant);
  assert.equal(html.status, 200);
  assert.match(await html.text(), new RegExp(`/${id}/assets/`));
  const js = await request(`/${id}/assets/${asset}`, grant);
  assert.equal(js.status, 200);
  assert.match(js.headers.get("content-type"), /javascript/);
  assert.match(js.headers.get("cache-control"), /no-store/);
  assert.equal((await request(`/${id}/images/bg-cat.webp`, grant)).status, 200);
  assert.equal((await request("/agentic-standards/1", grant)).status, 303);
  const otherAsset = (await readdir(path.join(config.dist, "agentic-standards/assets"))).find((name) =>
    name.endsWith(".js"),
  );
  assert.equal((await request(`/agentic-standards/assets/${otherAsset}`, grant)).status, 303);
  // Renaming a cookie cannot change its signed scope.
  const renamed = grant.replace(cookieName(id, true), cookieName("agentic-standards", true));
  assert.equal((await request("/agentic-standards/1", renamed)).status, 303);
});

test("expired, malformed and tampered grants fail closed", async () => {
  for (const grant of [cookie(id, Date.now() - 1000), `${cookieName(id, true)}=anything`, `${cookie()}x`]) {
    assert.equal((await request(`/${id}/1`, grant)).status, 303);
  }
  const token = signGrant(id, Date.now() + 60_000, config.secret);
  assert.equal(verifyGrant(token, id, "different-secret"), false);
  assert.equal(verifyGrant(token, id, config.secret, Date.now() + 120_000), false);
});

test("code exchange is scoped, single use and removes the code from the URL", async () => {
  assert.equal((await request(`/access/agentic-standards?code=${code}`)).status, 303);
  const res = await request(`/access/${id}?code=${code}`);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("location"), `/${id}/1`);
  const setCookie = res.headers.get("set-cookie");
  assert.match(setCookie, /__Host-schmack_playbook_decisioning-studio-go=/);
  assert.match(setCookie, /HttpOnly; SameSite=Lax; Max-Age=\d+; Secure/);
  assert.doesNotMatch(setCookie, /Domain=/);
  assert.equal((await request(`/${id}/1`, setCookie.split(";")[0])).status, 200);
  const replay = await request(`/access/${id}?code=${code}`);
  assert.match(replay.headers.get("location"), /folder=resources/);
  assert.equal(replay.headers.get("set-cookie"), null);
});

test("malformed codes and HEAD requests do not reach redemption", async () => {
  const previous = calls;
  assert.equal((await request(`/access/${id}?code=bad`)).status, 303);
  assert.equal((await request(`/access/${id}?code=${code}`, undefined, "HEAD")).status, 405);
  assert.equal(calls, previous);
});

test("database failure never grants access", async () => {
  outage = true;
  const res = await request(`/access/${id}?code=${code}`);
  outage = false;
  assert.equal(res.status, 503);
  assert.equal(res.headers.get("set-cookie"), null);
});

test("no alternate static paths or source files bypass protection", async () => {
  for (const route of [
    "/",
    "/index.html",
    `/dist/${id}/index.html`,
    "/src/playbooks/agentic-standards.tsx",
    `/assets/${asset}`,
  ]) {
    assert.equal((await request(route)).status, 303);
  }
  for (const suffix of [
    "assets/%2e%2e%2findex.html",
    "assets/../.env",
    "../agentic-standards/1",
    "assets/source.js.map",
  ]) {
    const res = await request(`/${id}/${suffix}`, cookie());
    assert.notEqual(res.status, 200);
  }
  assert.match(await (await request("/robots.txt")).text(), /Disallow: \//);
});

test("production bundles contain only their own playbook copy", async () => {
  const phrases = {
    "decisioning-studio-go": "At least 5% get random combinations",
    "agentic-standards": "Inside the SCHMACK Standard for Canvas",
    "conversational-agents": "Getting round the inbound limit",
  };
  for (const [deck, ownPhrase] of Object.entries(phrases)) {
    const dir = path.join(config.dist, deck, "assets");
    const files = await readdir(dir);
    const js = (
      await Promise.all(
        files.filter((name) => name.endsWith(".js")).map((name) => readFile(path.join(dir, name), "utf8")),
      )
    ).join("\n");
    assert.ok(js.includes(ownPhrase), `${deck} contains its own content`);
    for (const [other, phrase] of Object.entries(phrases))
      if (other !== deck) assert.ok(!js.includes(phrase), `${deck} must not include ${other}`);
    assert.ok(!files.some((name) => name.endsWith(".map")));
  }
});

test("Supabase redemption sends a hash, checks scope and handles errors", async () => {
  let mode = "ok";
  const service = createServer(async (req, res) => {
    let body = "";
    for await (const part of req) body += part;
    assert.equal(req.url, "/rest/v1/rpc/redeem_playbook_access");
    assert.equal(req.headers.authorization, "Bearer test-service-key");
    assert.deepEqual(JSON.parse(body), {
      p_code_hash: createHash("sha256").update(code).digest("hex"),
      p_playbook_id: id,
    });
    res.setHeader("Content-Type", "application/json");
    if (mode === "error") {
      res.writeHead(500);
      return res.end("{}");
    }
    res.end(
      JSON.stringify(
        mode === "used"
          ? []
          : [
              {
                playbook_id: mode === "wrong" ? "agentic-standards" : id,
                access_expires_at: new Date(Date.now() + 60_000).toISOString(),
              },
            ],
      ),
    );
  });
  service.listen(0, "127.0.0.1");
  await once(service, "listening");
  try {
    const settings = { ...config, supabaseUrl: `http://127.0.0.1:${service.address().port}` };
    assert.ok(await redeemCode(settings, id, code));
    mode = "used";
    assert.equal(await redeemCode(settings, id, code), null);
    mode = "wrong";
    assert.equal(await redeemCode(settings, id, code), null);
    mode = "error";
    await assert.rejects(redeemCode(settings, id, code));
  } finally {
    await new Promise((resolve) => service.close(resolve));
  }
});
