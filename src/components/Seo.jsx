import { useEffect } from "react";

/**
 * Per-page SEO head tags.
 *
 * Applies the dashboard-managed metadata of the CURRENT page to the
 * document <head>, falling back to the site-wide defaults (the values
 * shipped in index.html) whenever the page has no custom value. Every
 * route renders one of these, so metadata never "leaks" from a
 * previously visited page — navigating to a page without custom SEO
 * resets the head to the defaults.
 *
 * Implementation note: this intentionally does NOT use react-helmet-async.
 * That library silently renders nothing under React 19 (this app is on
 * React 19.2), which is why per-page metadata never appeared. Instead we
 * update the ONE existing tag of each kind in place — no duplicates, and
 * the SSG prerender (which executes JS) captures the correct values.
 *
 * Usage:
 *   <Seo meta={page.meta} fallbackTitle={page.title} />
 *   <Seo title="The Bulletin | DMIHER" />
 */

export const SITE_DEFAULT_TITLE =
  "DMIHER | Datta Meghe Institute of Higher Education and Research";
export const SITE_DEFAULT_DESCRIPTION =
  "Official website of Datta Meghe Institute of Higher Education and Research (DMIHER) — Medical, Dental, Nursing, and Allied Health Sciences.";

// Dashboard fields can arrive as the literal string "null" / "Null";
// treat any casing of it as empty so junk values fall back to defaults.
const clean = (val) => {
  const s = val == null ? "" : String(val).trim();
  return s && s.toLowerCase() !== "null" ? s : "";
};

/** Create-or-update a single <meta> tag identified by name= or property=. */
function setMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    // No value and no default → remove a previously set tag (keywords).
    if (el && el.dataset.dmSeo === "1") el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.dataset.dmSeo = "1";
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Seo({ meta = {}, title, fallbackTitle }) {
  const pageTitle =
    clean(title) ||
    clean(meta?.title) ||
    clean(fallbackTitle) ||
    SITE_DEFAULT_TITLE;
  const description = clean(meta?.description) || SITE_DEFAULT_DESCRIPTION;
  const keywords = clean(meta?.keywords);

  useEffect(() => {
    document.title = pageTitle;
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);
    setMetaTag("property", "og:title", pageTitle);
    setMetaTag("property", "og:description", description);
  }, [pageTitle, description, keywords]);

  return null;
}
