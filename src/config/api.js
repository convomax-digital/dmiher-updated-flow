import axios from "axios";
import {
  getTokenAsync,
  refreshToken,
  invalidateToken,
} from "../utils/auth";

export const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    ...(API_KEY ? { "X-API-KEY": API_KEY } : {}),
  },
});

api.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  if (API_KEY) config.headers["X-API-KEY"] = API_KEY;

  if (config.url === "/auth/token") return config;

  const token = await getTokenAsync();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // A misbehaving server/proxy can return an HTML error page with HTTP 200
    // (e.g. PHP warning page when the dev server starts with the wrong cwd).
    // On a JSON API that HTML must never reach components as "data" — reject
    // it so React Query goes to its error/retry path instead of rendering
    // broken markup.
    const data = response?.data;
    if (typeof data === "string" && /^\s*</.test(data)) {
      return Promise.reject(
        Object.assign(new Error("API returned HTML instead of JSON"), {
          response,
          config: response.config,
          code: "ERR_HTML_RESPONSE",
        })
      );
    }
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Transient connection drop (the single-threaded dev server can refuse a
    // request under burst load; the browser then reports it as a CORS/network
    // failure). Retry idempotent GETs once after a short pause instead of
    // surfacing a broken section.
    if (
      !response &&
      (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") &&
      config &&
      (config.method || "get").toLowerCase() === "get" &&
      !config.__netRetry
    ) {
      config.__netRetry = true;
      await new Promise((r) => setTimeout(r, 400));
      return api(config);
    }

    if (response?.status === 401 && config && !config.__isRetry) {
      invalidateToken();
      try {
        const newToken = await refreshToken();
        config.__isRetry = true;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    if (response?.status >= 500) {
      console.error("[api] server error", response.status, config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;
