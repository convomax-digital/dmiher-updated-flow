import { useEffect } from "react";
import useSiteSettings from "../hooks/useSiteSettings";

/**
 * Applies the dashboard-managed Frontend Theme (Settings → Frontend Theme)
 * to the public site at runtime:
 *
 *  - Button colors (background / hover / text) for the site's PRIMARY
 *    action buttons — the red "Apply Now"-style CTAs (Tailwind bg-red-5xx/
 *    6xx/7xx utilities on <a>/<button>) and the hero `.btn-primary`.
 *  - Default fonts: headings (h1–h6) and body text. Elements that declare
 *    their own font (e.g. editor text given a specific font) keep it.
 *  - Loads the chosen Google Fonts stylesheets on demand.
 *
 * Every rule is emitted ONLY for values the admin actually set — with no
 * theme configured this renders nothing and the site looks exactly as
 * built. Renders no DOM of its own (head-only side effects).
 */

const STYLE_ID = "dm-theme-styles";
const FONT_LINK_ATTR = "data-dm-theme-font";

// The site's primary action buttons: the brand-orange CTAs (the custom
// .hero-apply-btn class and Tailwind arbitrary-value bg-[#F04E30] used by
// "Apply Now"-style buttons across sections), the hero .btn-primary, and
// red bg-red-5xx/6xx/7xx utility CTAs.
const CTA_BASES = [
  ".hero-apply-btn",
  ".btn-primary",
  'a[class*="bg-[#F04E30]"]',
  'button[class*="bg-[#F04E30]"]',
  'a[class*="bg-[#f04e30]"]',
  'button[class*="bg-[#f04e30]"]',
  'a[class*="bg-red-5"]',
  'button[class*="bg-red-5"]',
  'a[class*="bg-red-6"]',
  'button[class*="bg-red-6"]',
  'a[class*="bg-red-7"]',
  'button[class*="bg-red-7"]',
];

const CTA_SELECTOR = CTA_BASES.join(", ");
const CTA_HOVER_SELECTOR = CTA_BASES.map((s) => s + ":hover").join(", ");

const HEX = /^#[0-9a-fA-F]{6}$/;

function buildCss(theme) {
  const rules = [];
  const btn = theme?.button || {};
  const fonts = theme?.fonts || {};

  const ctaProps = [];
  if (HEX.test(btn.bg || "")) ctaProps.push(`background: ${btn.bg} !important`);
  if (HEX.test(btn.text || "")) ctaProps.push(`color: ${btn.text} !important`);
  if (ctaProps.length) {
    rules.push(`${CTA_SELECTOR} { ${ctaProps.join("; ")}; }`);
  }
  if (HEX.test(btn.hover || "")) {
    rules.push(
      `${CTA_HOVER_SELECTOR} { background: ${btn.hover} !important; }`
    );
  }

  if (fonts.heading) {
    rules.push(
      `h1, h2, h3, h4, h5, h6 { font-family: '${fonts.heading}', sans-serif !important; }`
    );
  }
  if (fonts.body) {
    rules.push(`body { font-family: '${fonts.body}', sans-serif; }`);
  }

  return rules.join("\n");
}

export default function ThemeStyles() {
  const settings = useSiteSettings();
  const theme = settings?.theme;

  useEffect(() => {
    if (typeof document === "undefined") return;

    // ── Google Fonts the theme needs ──
    const wanted = (theme?.fonts?.google || []).filter(Boolean);
    const existing = Array.from(
      document.head.querySelectorAll(`link[${FONT_LINK_ATTR}]`)
    );
    existing.forEach((l) => {
      if (!wanted.includes(l.getAttribute(FONT_LINK_ATTR))) l.remove();
    });
    wanted.forEach((family) => {
      if (
        !document.head.querySelector(`link[${FONT_LINK_ATTR}="${family}"]`)
      ) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.setAttribute(FONT_LINK_ATTR, family);
        link.href =
          "https://fonts.googleapis.com/css2?family=" +
          encodeURIComponent(family).replace(/%20/g, "+") +
          ":wght@400;500;600;700&display=swap";
        document.head.appendChild(link);
      }
    });

    // ── Theme override rules ──
    const css = buildCss(theme);
    let styleEl = document.getElementById(STYLE_ID);
    if (!css) {
      if (styleEl) styleEl.remove();
      return;
    }
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    if (styleEl.textContent !== css) styleEl.textContent = css;
  }, [theme]);

  return null;
}
