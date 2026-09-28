import axios from "axios";

// In dev, client-side requests use a relative baseURL so they go through
// Vite's /api proxy (see vite.config.js). Hitting VITE_API_BASE directly
// triggers CORS because the local Laravel dev server at 127.0.0.1:8000 doesn't
// send CORS headers. On the SSR/Node side there is no browser origin, so the
// absolute VITE_API_BASE is used regardless of mode.
const IS_BROWSER = typeof window !== "undefined";
const API_BASE =
  IS_BROWSER && import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE;
const REFRESH_INTERVAL_MS = 50 * 1000;

const tokenClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

let currentToken = null;
let inFlight = null;
let refreshTimer = null;

async function fetchTokenFromServer() {
  const { data } = await tokenClient.get("/api/auth/token");
  if (!data?.token) throw new Error("Token missing in /auth/token response");
  return data.token;
}

export async function fetchToken() {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      currentToken = await fetchTokenFromServer();
      return currentToken;
    } catch (e) {
      console.error("Token error:", e);
      throw e;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export const refreshToken = fetchToken;

export function getToken() {
  return currentToken;
}

export async function getTokenAsync() {
  if (currentToken) return currentToken;
  return fetchToken();
}

export function invalidateToken() {
  currentToken = null;
}

// Refresh the moment a hidden tab becomes visible again: its token has
// almost certainly rotated past the 60s HMAC window while it was skipped.
function handleVisibilityChange() {
  if (!document.hidden) {
    fetchToken().catch(() => {});
  }
}

export function startTokenAutoRefresh() {
  if (refreshTimer) return;

  fetchToken().catch(() => {});

  // Skip the refresh while the tab is hidden. Every open tab used to hit
  // /api/auth/token every 50s forever — with many visitors that background
  // traffic alone was a constant load on the same server that runs the
  // dashboard. A stale token after returning is covered twice over: the
  // visibilitychange refresh below, and the 401-retry path in config/api.js.
  refreshTimer = setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    fetchToken().catch(() => {});
  }, REFRESH_INTERVAL_MS);

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
}

export function stopTokenAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }
}
