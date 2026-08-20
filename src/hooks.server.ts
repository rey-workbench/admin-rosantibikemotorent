import { redirect, type Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const handle: Handle = async ({ event, resolve }) => {
  // Route Protection
  const isLoginPage = event.url.pathname.startsWith("/login");
  const token = event.cookies.get("accessToken");

  let user = null;
  if (token) {
    try {
      const API_URL = env.API_URL || env.VITE_WS_URL || env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:3030";
      const res = await event.fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        user = await res.json();
      } else {
        event.cookies.delete("accessToken", { path: "/" });
      }
    } catch (e) {
      console.error("Auth verification failed:", e);
    }
  }

  if (!user && !isLoginPage) {
    throw redirect(302, "/login");
  }

  if (user && isLoginPage) {
    throw redirect(302, "/");
  }

  // Apply security headers
  const response = await resolve(event);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  const rawApiUrl = env.API_URL || env.VITE_WS_URL || env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:3030";
  let apiOrigin = "http://localhost:3030";
  let wsOrigin = "ws://localhost:3030";
  try {
    const parsed = new URL(rawApiUrl);
    apiOrigin = parsed.origin;
    wsOrigin = parsed.origin.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  } catch {}

  const connectSrcList = Array.from(new Set(["'self'", apiOrigin, wsOrigin])).join(" ");

  // script-src tanpa 'unsafe-inline' — pakai nonce dari SvelteKit (mode: auto)
  // sehingga inline script SvelteKit tetap jalan tapi inline script attacker diblokir.
  const scriptNonce = event.csp?.nonce ? ` 'nonce-${event.csp.nonce}'` : "";

  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self'${scriptNonce}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src ${connectSrcList}; object-src 'none'; frame-ancestors 'none';`,
  );
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");

  return response;
};

export const handleError = ({ error }: { error: unknown }) => {
  // Server-only log to avoid exposing trace details to client
  console.error("Admin server error:", error);
  return {
    message: "Terjadi kesalahan internal.",
  };
};
