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

export function startTokenAutoRefresh() {
  if (refreshTimer) return;

  fetchToken().catch(() => {});

  refreshTimer = setInterval(() => {
    fetchToken().catch(() => {});
  }, REFRESH_INTERVAL_MS);
}

export function stopTokenAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
