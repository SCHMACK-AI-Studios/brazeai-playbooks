import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function cookieName(id, secure) {
  return `${secure ? "__Host-" : ""}schmack_playbook_${id}`;
}

export function signGrant(id, expiresAt, secret) {
  const payload = Buffer.from(JSON.stringify({ v: 1, id, exp: expiresAt })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

export function verifyGrant(token, id, secret, now = Date.now()) {
  if (!token || token.length > 1024) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const grant = JSON.parse(Buffer.from(payload, "base64url").toString());
    return grant.v === 1 && grant.id === id && Number.isSafeInteger(grant.exp) && grant.exp > now;
  } catch {
    return false;
  }
}

export function readCookie(header, name) {
  for (const part of (header ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

/** Atomic SQL redemption ensures a code can be used only once, including across server instances. */
export async function redeemCode(config, id, code) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/redeem_playbook_access`, {
    method: "POST",
    headers: {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${config.supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_code_hash: createHash("sha256").update(code).digest("hex"),
      p_playbook_id: id,
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Access service unavailable");
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) return null;
  const grant = rows[0];
  const expiresAt = Date.parse(grant.access_expires_at);
  if (grant.playbook_id !== id || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return null;
  return expiresAt;
}
