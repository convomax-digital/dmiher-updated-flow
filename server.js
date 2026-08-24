import fs from "node:fs/promises";
import crypto from "node:crypto";
import express from "express";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

// Read VITE_API_BASE from .env so the CSP can whitelist the Laravel backend
// host. process.env is not populated by Vite for non-Vite-bundled code, so
// parse the file directly.
async function loadEnv() {
  const out = {};
  for (const f of [".env", ".env.local", `.env.${process.env.NODE_ENV || "development"}`]) {
    try {
      const text = await fs.readFile(f, "utf-8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !line.trim().startsWith("#")) {
          out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
        }
      }
    } catch {}
  }
  return out;
}
const env = await loadEnv();
const apiBase = process.env.VITE_API_BASE || env.VITE_API_BASE || "";

function sha256(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("base64");
}

// Frontend and backend origins used in the production CSP. The frontend also
// self-serves some fonts/CSS which browsers treat as a distinct origin from
// bare 'self' when the request goes over an absolute URL — mirroring what the
// reference site (dmmcnagpur.com) does.
const FRONTEND_ORIGIN = "https://www.dmiher.edu.in";
const BACKEND_ORIGIN = "https://admin.dmiher.edu.in";

function buildCsp(nonce, scriptHashes = []) {
  const hashList = scriptHashes.map((h) => `'sha256-${h}'`).join(" ");
  if (!isProduction) {
    // Dev: Vite injects an inline React-refresh preamble + uses HMR over WS,
    // and components render with React inline `style={{}}` attributes.
    // Mirror the original vite.config.js dev CSP — `'unsafe-inline'` for
    // script/style, `'unsafe-eval'` for transformed modules, http+ws for the
    // local backend.
    return [
      "default-src 'self'",
      // Important: don't add hashes/nonces here. Per CSP spec, browsers
      // ignore 'unsafe-inline' as soon as any hash or nonce appears in the
      // same source list — which would block Vite's React-refresh preamble.
      // In dev we rely on 'unsafe-inline' for everything; the hash matters in
      // production where 'unsafe-inline' is absent.
      // Third-party script hosts mirrored from the production CSP so dev
      // doesn't silently block them (NoPaperForms enquiry widget, GA, GTM,
      // GetAAI chatbot). Niaa chatbot loads from chatbot.in6.nopaperforms.com
      // and pulls jQuery + its icon image from chatcdn.npfs.co — keep both.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widgets.in6.nopaperforms.com https://chatbot.in6.nopaperforms.com https://chatcdn.npfs.co https://www.googletagmanager.com https://www.google-analytics.com https://static.getaai.com",
      "style-src 'self' 'unsafe-inline' https://chatbot.in6.nopaperforms.com",
      `img-src 'self' https: http: data:`,
      "font-src 'self' https: data:",
      `connect-src 'self' https: http: ws://localhost:* wss://localhost:* ${apiBase}`,
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://docs.google.com https://drive.google.com https://www.googletagmanager.com https://widgets.in6.nopaperforms.com https://chatbot.in6.nopaperforms.com",
      "frame-ancestors 'self'",
      "form-action 'self' https://api.web3forms.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");
  }

  // Production CSP — matches the securityheaders.com A+ reference layout
  // (default-src → script-src → style-src → font-src → img-src → connect-src
  // → frame-src). Nonce is per-request, no `'unsafe-inline'`/`'unsafe-eval'`
  // in script-src. `'unsafe-inline'` stays on style-src only because React
  // renders many components with inline `style={{}}` attributes that a nonce
  // cannot cover — the reference site keeps it there too. Extra third-party
  // hosts (GA/GTM, NoPaperForms widgets, GetAAI chatbot, backend API) are the
  // integrations DMIHER actually uses; dropping them would break the site.
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${hashList} https://www.googletagmanager.com https://www.google-analytics.com https://widgets.in6.nopaperforms.com https://chatbot.in6.nopaperforms.com https://chatcdn.npfs.co https://static.getaai.com`.replace(/\s+/g, " "),
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${FRONTEND_ORIGIN} https://chatbot.in6.nopaperforms.com`,
    `font-src 'self' data: https://fonts.gstatic.com ${FRONTEND_ORIGIN}`,
    `img-src 'self' data: ${BACKEND_ORIGIN}`,
    `connect-src 'self' ${BACKEND_ORIGIN} https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://api.web3forms.com https://static.getaai.com https://chatbot.in6.nopaperforms.com`,
    "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://docs.google.com https://drive.google.com https://www.googletagmanager.com https://chatbot.in6.nopaperforms.com",
    "frame-ancestors 'self'",
    "form-action 'self' https://api.web3forms.com",
    "object-src 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// Companion hardening headers required for a securityheaders.com A+ grade,
// matching the reference dmmcnagpur.com report exactly.
const SECURITY_HEADERS = {
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

const app = express();

// Apply the security headers — including a baseline Content-Security-Policy —
// to EVERY response (static assets, redirects, and the SSR HTML), not just the
// SSR route. securityheaders.com scans whatever path it lands on, so a policy
// set only on the SSR 200 leaves other responses (e.g. a bare "/dmiher_web"
// redirect or a static file) without CSP and caps the grade. The SSR handler
// below overrides Content-Security-Policy with a per-request nonce'd policy for
// its inline dehydration script; this baseline covers everything else.
if (isProduction) {
  app.use((req, res, next) => {
    res.set(SECURITY_HEADERS);
    res.set(
      "Content-Security-Policy",
      buildCsp(crypto.randomBytes(24).toString("base64"))
    );
    next();
  });
}

let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.use(/.*/, async (req, res) => {
  try {
    const url = req.originalUrl;

    let template;
    let render;
    if (!isProduction) {
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    const rendered = await render(url);

    const nonce = crypto.randomBytes(24).toString("base64");

    const stateJson = JSON.stringify(rendered.state ?? {}).replace(
      /</g,
      "\\u003c"
    );
    // Inline script body — hash this content (not the surrounding <script>
    // tags) and add 'sha256-<hash>' to script-src so the dehydration script
    // executes without needing a nonce attribute.
    const stateBody = `window.__REACT_QUERY_STATE__ = ${stateJson};`;
    const stateHash = sha256(stateBody);
    const stateScript = `<script>${stateBody}</script>`;

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "")
      .replace(`<!--app-state-->`, stateScript)
      .replaceAll("__CSP_NONCE__", nonce);

    res
      .status(200)
      .set({
        "Content-Type": "text/html",
        "Content-Security-Policy": buildCsp(nonce, [stateHash]),
        // The Strict-Transport-Security / cross-origin / X-* / Referrer-Policy /
        // Permissions-Policy set required for a securityheaders.com A+ grade.
        // Only sent in production so HMR websockets and localhost tooling still
        // work in dev.
        ...(isProduction ? SECURITY_HEADERS : {}),
      })
      .send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e.stack);
    // SSR failed — never show the user a stack trace / broken page. Serve the
    // plain SPA shell instead (empty app root, no dehydrated state): the
    // client bundle boots and renders the page entirely client-side.
    try {
      let template;
      if (!isProduction) {
        template = await fs.readFile("./index.html", "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = templateHtml;
      }
      const nonce = crypto.randomBytes(24).toString("base64");
      const shell = template
        .replace(`<!--app-head-->`, "")
        .replace(`<!--app-html-->`, "")
        .replace(`<!--app-state-->`, "")
        .replaceAll("__CSP_NONCE__", nonce);
      res
        .status(200)
        .set({
          "Content-Type": "text/html",
          "Content-Security-Policy": buildCsp(nonce),
          ...(isProduction ? SECURITY_HEADERS : {}),
        })
        .send(shell);
    } catch {
      // Even the shell failed — minimal, valid page rather than a stack dump.
      res.status(500).set("Content-Type", "text/html").end("<!doctype html><title>Error</title><p>Something went wrong. Please refresh.</p>");
    }
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
