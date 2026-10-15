import path from "node:path";
import { fileURLToPath } from "node:url";

function origin(value, name, allowHttp) {
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash)
    throw new Error(`${name} must be an origin only`);
  if (
    url.protocol !== "https:" &&
    !(allowHttp && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
  ) {
    throw new Error(`${name} must use HTTPS (HTTP is allowed only on localhost in development)`);
  }
  return url.origin;
}

export function loadConfig(env = process.env) {
  const development = env.NODE_ENV === "development";
  const publicOrigin = origin(env.PUBLIC_ORIGIN || "https://playbooks.schmack.com", "PUBLIC_ORIGIN", development);
  const websiteOrigin = origin(env.WEBSITE_ORIGIN || "https://schmack.com", "WEBSITE_ORIGIN", development);
  const secret = env.PLAYBOOK_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32)
    throw new Error("PLAYBOOK_SESSION_SECRET must contain at least 32 bytes");
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase access configuration is required");
  const supabaseUrl = origin(env.SUPABASE_URL, "SUPABASE_URL", development);
  const port = Number(env.PORT || 5195);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  return {
    publicOrigin,
    websiteOrigin,
    secret,
    supabaseUrl,
    port,
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
    secure: publicOrigin.startsWith("https:"),
    dist: fileURLToPath(new URL("../dist/", import.meta.url)),
    host: env.HOST || "0.0.0.0",
  };
}

export function resourcesUrl(config, id) {
  const url = new URL("/", config.websiteOrigin);
  url.searchParams.set("folder", "resources");
  if (id) url.searchParams.set("resource", id);
  return url.toString();
}

export function buildPath(config, id, relative) {
  return path.join(config.dist, id, relative);
}
