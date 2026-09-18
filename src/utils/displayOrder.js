/**
 * @file displayOrder.js
 * Shared sorting for the "Display Order" value editors set in the admin panel.
 *
 * The CMS stores `order` per item (as a string, e.g. "1") and the API returns
 * the array in whatever sequence it was saved in — NOT in display order. So
 * sorting has to happen on this side for the page to match what the admin
 * panel shows.
 *
 * Semantics, kept identical everywhere this is used:
 *   - items with a usable numeric order come first, ascending;
 *   - items without one keep their API position, after the ordered ones;
 *   - equal orders keep their API position (stable).
 *
 * Deliberately NOT `Number(x)` alone: clearing the Order box in the admin
 * saves "", and Number("") is 0 — finite, so a naive check accepts it and
 * shoots that item to the FRONT of the list. Blank, whitespace and any
 * non-numeric value all count as "no order" instead.
 *
 * Kept free of React so the mandatory-disclosure mapper, which also runs
 * during SSR/prerender, can use it.
 */

/**
 * Read an item's display order, or null when it has no usable one.
 *
 * @param {unknown} item
 * @returns {number|null}
 */
export const readDisplayOrder = (item) => {
  const raw = item?.order;

  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return null;
  }

  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

/**
 * Sort a list of CMS items by their display order. Returns a new array;
 * the input is not mutated.
 *
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export const sortByDisplayOrder = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({ item, index, order: readDisplayOrder(item) }))
    .sort((a, b) => {
      // Comparing two unordered items must not end up as Infinity - Infinity
      // (NaN), which leaves the result up to the engine — compare their
      // positions explicitly so the outcome is defined and stable.
      if (a.order === null && b.order === null) return a.index - b.index;
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order || a.index - b.index;
    })
    .map((entry) => entry.item);
};

export default sortByDisplayOrder;
