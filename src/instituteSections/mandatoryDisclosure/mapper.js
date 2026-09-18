import resolveImage from "../../utils/resolveImage";
import { sortByDisplayOrder } from "../../utils/displayOrder";

/**
 * @file mapper.js
 * Pure transformation layer: API payload -> UI-ready view model.
 * Keep this file free of React / JSX so it can be reused in tests,
 * SSG prerender, and any non-React consumer.
 */

const FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|webp|svg|gif)(\?.*)?$/i;
const HTTP_RE = /^https?:\/\//i;

const isHttp = (url = "") => HTTP_RE.test(url);
const isFile = (url = "") => FILE_RE.test(url);
const isPopupToken = (value) => value === "popup";

// Delegated to the central resolver so the assets/ → storage/ → bare
// path fallback chain stays in one place. Legacy callers that passed
// a known-absolute URL still get it back untouched.
const toAbsoluteUrl = (url) => resolveImage(url);

/**
 * Detects the semantic type of a link.
 * @param {string} link
 * @returns {"internal"|"external"|"file"|"popup"}
 */
export const detectLinkType = (link) => {
  if (!link) return "internal";
  if (isPopupToken(link)) return "popup";
  if (isFile(link)) return "file";
  if (isHttp(link)) return "external";
  return "internal";
};

/**
 * Build the internal route for a `card_page` CTA.
 *
 *   L1 (no parentSlug)  → /:college/mandatory-disclosure/:cta_key      (links into L2)
 *   L2 (parentSlug set) → /:college/mandatory-disclosure/:parentSlug/:cta_key  (links into L3)
 */
const buildInternalLink = (cta = {}, college, parentSlug) => {
  const key = cta?.cta_key || cta?.slug || "";
  if (!key) return "";
  const cleanKey = String(key).replace(/^\//, "");
  if (!college) return `/${cleanKey}`;
  if (parentSlug) {
    return `/${college}/mandatory-disclosure/${parentSlug}/${cleanKey}`;
  }
  return `/${college}/mandatory-disclosure/${cleanKey}`;
};

const isAlreadyMappedItem = (item) =>
  item &&
  typeof item === "object" &&
  "name" in item &&
  "link" in item;

const isAlreadyMappedViewModel = (value) =>
  value &&
  typeof value === "object" &&
  (
    (Array.isArray(value.items) &&
      (value.items.length === 0 || value.items.every(isAlreadyMappedItem))) ||
    (Array.isArray(value.tabs) && value.layout === "tab_cards")
  );

const normalizePopupContent = (pdfArr = []) =>
  (Array.isArray(pdfArr) ? pdfArr : [])
    .map((entry) => {
      if (!entry) return null;
      const name = entry.label || entry.name || entry.title || "";
      const rawLink = entry.pdf || entry.link || entry.url || "";
      const link = toAbsoluteUrl(rawLink);
      if (!name && !link) return null;
      return { name, link };
    })
    .filter(Boolean);

/**
 * Normalize a single card from the API into a UI item.
 * Safely tolerates null/undefined and unknown tab_type values.
 *
 * @param {object} card
 * @param {{ college?: string, parentSlug?: string }} [ctx]
 */
const normalizeCard = (card, ctx = {}) => {
  if (!card || typeof card !== "object") return null;

  const tabType = card.tab_type || card.type || "card_page";
  const name = card.title || card.name || card.label || "";

  switch (tabType) {
    case "direct_pdf": {
      const rawPdf = typeof card.pdf === "string" ? card.pdf : "";
      const link = toAbsoluteUrl(rawPdf);
      return { name, link, type: "file" };
    }

    case "url": {
      const rawUrl = card.url || card.link || "";
      const link = isHttp(rawUrl) ? rawUrl : toAbsoluteUrl(rawUrl);
      return { name, link, type: isFile(link) ? "file" : "external" };
    }

    case "video": {
      const id = String(card.video || "").trim();
      const link = id ? `https://www.youtube.com/watch?v=${id}` : "";
      return { name, link, type: link ? "external" : "internal" };
    }

    case "popup_pdf": {
      // popup_pdf can be either a flat array (legacy) or
      // { popup_title, pdf_items: [...] } (new shape from the admin).
      const items = Array.isArray(card?.pdf?.pdf_items)
        ? card.pdf.pdf_items
        : Array.isArray(card.pdf)
          ? card.pdf
          : [];
      const popopContent = normalizePopupContent(items);
      return {
        name,
        link: "popup",
        type: "popup",
        popopContent,
      };
    }

    case "card_page":
    default: {
      const link =
        buildInternalLink(card.cta, ctx.college, ctx.parentSlug) ||
        card.link ||
        card.url ||
        "";
      return { name, link, type: detectLinkType(link) };
    }
  }
};

/**
 * Unwraps common API envelopes to get the section data node:
 *  - { data: { sections: [{ section_id, data }] } }
 *  - { sections: [...] }
 *  - { section_id, data }
 *  - { header, cards }
 */
const unwrapSectionData = (raw) => {
  if (!raw || typeof raw !== "object") return {};

  const candidates = [];

  if (Array.isArray(raw?.sections)) candidates.push(...raw.sections);
  if (Array.isArray(raw?.data?.sections)) candidates.push(...raw.data.sections);

  if (candidates.length > 0) {
    const match =
      candidates.find((s) =>
        String(s?.section_id || "").toLowerCase().includes("mandatory")
      ) || candidates[0];
    return match?.data || {};
  }

  if (raw?.section_id && raw?.data) return raw.data;
  if (raw?.data && (raw.data.header || raw.data.cards)) return raw.data;

  return raw;
};

/**
 * Transform API response into UI view model.
 * Idempotent: if `raw` already has shape `{title, items}` or
 * `{title, layout:"tab_cards", tabs}`, returns it unchanged.
 *
 * Output shapes:
 *
 *   simple_cards (default):
 *     { title, layout: "simple_cards", items: [...] }
 *
 *   tab_cards:
 *     { title, layout: "tab_cards", tabs: [{ name, slug, items: [...] }] }
 *
 * @param {unknown} raw
 * @param {{ college?: string, parentSlug?: string }} [ctx]
 *   Context used to build internal links:
 *     - L1 (no parentSlug)  → links to L2: `/:college/mandatory-disclosure/:cta_key`
 *     - L2 (parentSlug set) → links to L3: `/:college/mandatory-disclosure/:parentSlug/:cta_key`
 */
export const mapMandatoryDisclosureData = (raw, ctx = {}) => {
  const empty = { title: "", layout: "simple_cards", items: [] };
  if (!raw) return empty;

  if (isAlreadyMappedViewModel(raw)) {
    return {
      title: raw.title || "",
      layout: raw.layout === "tab_cards" ? "tab_cards" : "simple_cards",
      items: Array.isArray(raw.items) ? raw.items : [],
      tabs: Array.isArray(raw.tabs) ? raw.tabs : undefined,
    };
  }

  const inner = unwrapSectionData(raw);

  if (isAlreadyMappedViewModel(inner)) {
    return {
      title: inner.title || "",
      layout: inner.layout === "tab_cards" ? "tab_cards" : "simple_cards",
      items: Array.isArray(inner.items) ? inner.items : [],
      tabs: Array.isArray(inner.tabs) ? inner.tabs : undefined,
    };
  }

  const title =
    inner?.header?.heading ||
    inner?.title ||
    "Mandatory Disclosures";

  const layout =
    inner?.header?.layout_type === "tab_cards" ? "tab_cards" : "simple_cards";

  const cards = Array.isArray(inner?.cards) ? inner.cards : [];

  // Everything below is ordered by the "Display Order" set in the admin panel
  // before it is normalised, using the same rules as the micro-page team grid
  // (see utils/displayOrder.js). The API returns these arrays in save order,
  // not display order. Content with no `order` set anywhere is unaffected —
  // every item falls back to its API position, so the current sequence stands.
  if (layout === "tab_cards") {
    // In tab_cards layout the API returns `cards` as an array of tabs:
    //   [{ tab_name, tab_slug, cards: [...] }, ...]
    // Both the tabs themselves and the cards inside each tab are ordered.
    const tabs = sortByDisplayOrder(cards)
      .map((tab) => {
        if (!tab || typeof tab !== "object") return null;
        const innerCards = Array.isArray(tab.cards) ? tab.cards : [];
        const items = sortByDisplayOrder(innerCards)
          .map((card) => normalizeCard(card, ctx))
          .filter((it) => it && (it.name || it.link));
        return {
          name: tab.tab_name || tab.name || tab.tab_slug || "",
          slug: tab.tab_slug || tab.slug || "",
          items,
        };
      })
      .filter((t) => t && (t.items.length > 0 || t.name));

    return { title, layout, tabs, items: [] };
  }

  const items = sortByDisplayOrder(cards)
    .map((card) => normalizeCard(card, ctx))
    .filter((it) => it && (it.name || it.link));

  return { title, layout, items };
};

export default mapMandatoryDisclosureData;
