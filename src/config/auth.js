import axios from "axios";

/**
 * Auth resolver — supports three modes, picked at build time from .env.
 *
 *   A) VITE_AUTH_TOKEN  → static Bearer token, NO login call
 *   B) VITE_AUTH_EMAIL + VITE_AUTH_PASSWORD → auto-login, token cached
 *   C) (neither set)    → no Authorization header sent at all (relies on
 *                          public endpoints or X-API-KEY in api.js)
 */

// In dev, client-side requests use a relative baseURL so they go through
// Vite's /api proxy (see vite.config.js). Hitting VITE_API_BASE directly
// triggers CORS because the local Laravel dev server at 127.0.0.1:8000 doesn't
// send CORS headers. On the SSR/Node side there is no browser origin, so the
// absolute VITE_API_BASE is used regardless of mode.
const IS_BROWSER = typeof window !== "undefined";
const API_BASE =
  IS_BROWSER && import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE;
const STATIC_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
const EMAIL = import.meta.env.VITE_AUTH_EMAIL;
const PASSWORD = import.meta.env.VITE_AUTH_PASSWORD;

const TOKEN_KEY = "dmiher_auth_token";
const EXPIRY_KEY = "dmiher_auth_expires_at";

// Refresh this many ms before expiry (only used in login mode).
const EARLY_REFRESH_WINDOW_MS = 5 * 60 * 1000;

// Bare client — never runs api.js's interceptors (avoids login loops).
const bareClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { Accept: "application/json" },
});

// Shared in-flight login promise (deduplicates concurrent calls).
let inFlightLogin = null;

const tokenIsValid = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token || !expiry) return false;

  const expiresAt = new Date(expiry).getTime();
  if (Number.isNaN(expiresAt)) return false;

  return expiresAt - EARLY_REFRESH_WINDOW_MS > Date.now();
};

const performLogin = async () => {
  const { data } = await bareClient.post("/auth/login", {
    email: EMAIL,
    password: PASSWORD,
  });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EXPIRY_KEY, data.expires_at);
  return data.token;
};

/**
 * Returns a Bearer token, or null if no auth is configured.
 *
 *   Mode A: returns the static token immediately.
 *   Mode B: returns the cached token, or logs in once if missing/expired.
 *   Mode C: returns null (api.js will just not attach an Authorization header).
 */
export const getAuthToken = async () => {
  // Mode A — static token, skip login entirely
  if (STATIC_TOKEN) return STATIC_TOKEN;

  // Mode C — no credentials configured
  if (!EMAIL || !PASSWORD) return null;

  // Mode B — auto-login flow
  if (tokenIsValid()) return localStorage.getItem(TOKEN_KEY);

  if (!inFlightLogin) {
    inFlightLogin = performLogin().finally(() => {
      inFlightLogin = null;
    });
  }
  return inFlightLogin;
};

/** Drop the cached token — next request triggers a fresh login (Mode B only). */
export const clearAuthToken = () => {
  if (STATIC_TOKEN) return; // Static tokens can't be refreshed from the client.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};
