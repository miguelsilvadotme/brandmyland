import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "bml_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function adminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminToken() {
  const nonce = randomBytes(16).toString("hex");
  const sig = scryptSync(`${nonce}.${secret()}`, "bml-admin", 32).toString("hex");
  return `${nonce}.${sig}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token || !secret()) return false;
  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;
  const expected = scryptSync(`${nonce}.${secret()}`, "bml-admin", 32).toString("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminRequest() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminRequest())) {
    throw new Error("Unauthorized");
  }
}

export { COOKIE as ADMIN_COOKIE };
