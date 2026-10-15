import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import playbooks from "../config/playbooks.json" with { type: "json" };
import { cookieName, readCookie, redeemCode, signGrant, verifyGrant } from "./access.mjs";
import { buildPath, resourcesUrl } from "./config.mjs";

const ids = new Set(playbooks.map((p) => p.id));
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function redirect(res, location) {
  res.writeHead(303, { Location: location });
  res.end();
}

export function createApp(config, { redeem = (id, code) => redeemCode(config, id, code) } = {}) {
  return createServer(async (req, res) => {
    // Apply to HTML, assets, errors and redirects. Never allow a CDN to cache authorised content.
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Vary", "Cookie");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { Allow: "GET, HEAD" });
        return res.end();
      }
      const url = new URL(req.url, config.publicOrigin);
      if (url.pathname === "/health") return res.end("ok");
      if (url.pathname === "/robots.txt") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.end("User-agent: *\nDisallow: /\n");
      }

      const access = /^\/access\/([a-z-]+)$/.exec(url.pathname);
      if (access && ids.has(access[1])) {
        const id = access[1];
        if (req.method === "HEAD") {
          res.writeHead(405, { Allow: "GET" });
          return res.end();
        }
        const code = url.searchParams.get("code");
        if (!code || !/^[A-Za-z0-9_-]{43}$/.test(code)) return redirect(res, resourcesUrl(config, id));
        const expiresAt = await redeem(id, code);
        if (!expiresAt) return redirect(res, resourcesUrl(config, id));
        const maxAge = Math.floor((expiresAt - Date.now()) / 1000);
        if (maxAge <= 0) return redirect(res, resourcesUrl(config, id));
        const token = signGrant(id, expiresAt, config.secret);
        res.setHeader(
          "Set-Cookie",
          `${cookieName(id, config.secure)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${config.secure ? "; Secure" : ""}`,
        );
        return redirect(res, `/${id}/1`);
      }

      const match = /^\/([a-z-]+)(?:\/(.*))?$/.exec(url.pathname);
      if (!match || !ids.has(match[1])) return redirect(res, resourcesUrl(config));
      const [, id, suffix = ""] = match;
      const token = readCookie(req.headers.cookie, cookieName(id, config.secure));
      if (!verifyGrant(token, id, config.secret)) return redirect(res, resourcesUrl(config, id));

      let relative;
      if (!suffix || /^[1-9]\d*$/.test(suffix) || suffix === "index.html" || suffix === "presenter")
        relative = "index.html";
      else if (
        /^(?:assets|images|illustrations|logos)\/[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(suffix) ||
        suffix === "favicon.png"
      )
        relative = suffix;
      else {
        res.writeHead(404);
        return res.end("Not found");
      }
      const file = buildPath(config, id, relative);
      const info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.setHeader("Content-Type", MIME[path.extname(relative)] || "application/octet-stream");
      res.setHeader("Content-Length", info.size);
      if (req.method === "HEAD") return res.end();
      const stream = createReadStream(file);
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      stream.pipe(res);
    } catch {
      // Never log access URLs, codes, cookies or service credentials.
      console.error("Playbook request failed");
      if (!res.headersSent) res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Access is temporarily unavailable. Please try again.");
    }
  });
}
