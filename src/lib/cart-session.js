import { randomBytes } from "node:crypto";

export const CART_SESSION_COOKIE = "flavour_forge_cart";

const CART_SESSION_PATTERN = /^[a-f0-9]{64}$/;

export function isValidCartSession(value) {
  return typeof value === "string" && CART_SESSION_PATTERN.test(value);
}

export function readCartSession(request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_SESSION_COOKIE}=`))
    ?.slice(CART_SESSION_COOKIE.length + 1);

  if (isValidCartSession(existing)) {
    return { ownerKey: existing, shouldSetCookie: false };
  }

  return {
    ownerKey: randomBytes(32).toString("hex"),
    shouldSetCookie: true,
  };
}

export function setCartSessionCookie(response, session) {
  if (!session.shouldSetCookie) return response;

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${CART_SESSION_COOKIE}=${session.ownerKey}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`,
  );
  return response;
}

export function cartSessionResponse(session, body, init) {
  return setCartSessionCookie(Response.json(body, init), session);
}
