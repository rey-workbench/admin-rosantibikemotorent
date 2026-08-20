import { redirect, type Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const handle: Handle = async ({ event, resolve }) => {
  // Route Protection
  const isLoginPage = event.url.pathname.startsWith("/login");
  const token = event.cookies.get("accessToken");

  let user = null;
  if (token) {
    try {
      const API_URL =
        env.API_URL ||
        env.VITE_WS_URL ||
        env.VITE_API_URL?.replace(/\/api$/, "") ||
        "http://localhost:3030";
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

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );

  return response;
};

export const handleError = ({ error }: { error: unknown }) => {
  console.error("Admin server error:", error);
  return {
    message: "Terjadi kesalahan internal.",
  };
};
