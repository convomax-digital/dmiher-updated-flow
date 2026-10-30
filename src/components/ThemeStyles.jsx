import { useEffect } from "react";
import useSiteSettings from "../hooks/useSiteSettings";

/**
 * Applies the dashboard-managed Frontend Theme (Settings → Frontend Theme)
 * to the public site at runtime:
 *
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

/**
 * Everything the theme fonts must NOT touch.
 *
 *  - `.prose` and `.prose *` — RichTextRenderer's wrapper. All editor-authored
 *    HTML lands inside it, and the editor expresses its font choices there as
 *    classes (`font-oswald-medium`) or inline styles. Overriding inside this
 *    subtree would flatten exactly the per-text formatting the editor is for.
 *  - code/pre/kbd/samp — these are monospace on purpose.
 */
const SKIP = ":not(.prose):not(.prose *):not(code):not(pre):not(kbd):not(samp)";

function buildCss(theme) {
  const rules = [];
  const fonts = theme?.fonts || {};

  if (fonts.body) {
    const body = `'${fonts.body}', sans-serif`;

    // Plain inheritance, for anything that picks the font up from the document
    // (form controls, pseudo-elements, text nodes directly under <body>).
    rules.push(`body { font-family: ${body}; }`);

    // …and an explicit override, because inheritance alone was never enough:
    // ~50 section rules across the stylesheets hard-code `font-family: Oswald`
    // (.footer-subtitle, .counter-value, .recog-heading …) and Tailwind's
    // font-sans / font-[Arial] utilities do the same. Those beat `body`, which
    // is why picking a font in the dashboard appeared to do nothing.
    rules.push(`body *${SKIP} { font-family: ${body} !important; }`);

    // The editor container itself (but NOT its contents) takes the body font,
    // so rich text the editor left unstyled starts in the site font instead of
    // inheriting whatever the surrounding section class happened to set.
    rules.push(`.prose { font-family: ${body}; }`);
  }

  if (fonts.heading) {
    // Listed after the body rule and carrying one extra element in the
    // selector, so it wins for headings while both are !important.
    rules.push(
      `body :is(h1, h2, h3, h4, h5, h6)${SKIP} { font-family: '${fonts.heading}', sans-serif !important; }`
    );
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
