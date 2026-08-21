import { browser } from "$app/environment";
import { toast } from "$lib/stores/toast";

let rawUrl = import.meta.env.VITE_API_URL;
if (!rawUrl) {
  if (browser) {
    rawUrl = `${window.location.protocol}//${window.location.hostname}:3030/api`;
  } else {
    rawUrl =
      (typeof process !== "undefined" ? process.env.API_URL : null) ||
      "http://localhost:3030";
    if (!rawUrl.endsWith("/api")) {
      rawUrl = `${rawUrl}/api`;
    }
  }
}
const API_BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

// Auth token kini dikelola via httpOnly cookie (di-set backend saat login),
// dikirim otomatis oleh browser (credentials: "include").
// TIDAK menyimpan token di localStorage/sessionStorage (anti XSS theft).
//
// getToken() dipertahankan untuk kompatibilitas (mis. WebSocket) namun
// tidak membaca storage apa pun — token httpOnly tidak bisa diakses JS.
function getToken(): string | null {
  return null;
}

export function clearToken(): void {
  // Tidak ada lagi token di storage — bersihkan sisa legacy dari versi lama
  if (!browser) return;
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
}

function buildUrl(url: string, params?: any): string {
  let fetchUrl = `${API_BASE_URL}${url}`;
  if (!params) return fetchUrl;

  const searchParams = new URLSearchParams();
  for (const key in params) {
    const val = params[key];
    if (val !== undefined && val !== null) {
      searchParams.append(key, String(val));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${fetchUrl}?${qs}` : fetchUrl;
}

function buildHeadersAndBody(data?: any, customHeaders?: any) {
  const headers: Record<string, string> = {
    ...(customHeaders || {}),
  };

  // Token dikirim otomatis via httpOnly cookie (credentials: "include")
  // — tidak perlu Authorization header dari JS.

  // Provide an Origin header during SSR to pass backend CORS checks
  if (!browser && !headers["Origin"] && !headers["origin"]) {
    headers["Origin"] = "https://rosantibikemotorent.com";
  }

  let body = undefined;
  if (data !== undefined && data !== null) {
    if (data instanceof FormData) {
      body = data;
    } else {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      body = JSON.stringify(data);
    }
  }
  return { headers, body };
}

async function parseResponse(response: Response, url: string, method: string) {
  const contentType = response.headers.get("content-type");
  const responseData =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const error: any = new Error(responseData?.message || "Request failed");
    error.response = {
      status: response.status,
      data: responseData,
    };
    throw error;
  }

  const isWhatsapp = url.includes("/whatsapp");
  if (browser && method !== "GET" && responseData?.message && !isWhatsapp) {
    const type = responseData.type || "success";
    const successMsg = responseData.userErrorMsg || responseData.message;
    toast.add(successMsg, type as any);
  }

  return { data: responseData, status: response.status };
}

function handleError(error: any): never {
  if (browser) {
    const status = error.response?.status;
    const rawMsg = error.response?.data?.message;
    const message = Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg;

    if (status === 401) {
      clearToken(); // bersihkan sisa legacy storage
      if (browser && window.location.pathname !== "/login") {
        window.location.href = "/login";
      } else if (
        message &&
        typeof message === "string" &&
        message.length < 100
      ) {
        toast.error(message);
      }
    } else if (status === 429) {
      toast.error("Terlalu banyak percobaan. Silakan coba lagi nanti.");
    } else if (message && typeof message === "string" && message.length < 100) {
      toast.error(message);
    } else {
      toast.error("An error occurred");
    }
  }
  throw error;
}

class ApiClient {
  async request(method: string, url: string, data?: any, config: any = {}) {
    const fetchUrl = buildUrl(url, config.params);
    const { headers, body } = buildHeadersAndBody(data, config.headers);

    try {
      const response = await fetch(fetchUrl, {
        method,
        headers,
        body,
        credentials: "include",
      });
      return await parseResponse(response, url, method);
    } catch (error: any) {
      handleError(error);
    }
  }

  get(url: string, config?: any) {
    return this.request("GET", url, undefined, config);
  }
  post(url: string, data?: any, config?: any) {
    return this.request("POST", url, data, config);
  }
  put(url: string, data?: any, config?: any) {
    return this.request("PUT", url, data, config);
  }
  patch(url: string, data?: any, config?: any) {
    return this.request("PATCH", url, data, config);
  }
  delete(url: string, config?: any) {
    return this.request("DELETE", url, undefined, config);
  }
}

export const api = new ApiClient();
