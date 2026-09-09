/**
 * Sort tabs, or the program cards inside a tab, by the `order` the admin sets
 * in the panel (Programs → Tabs → Order). Ascending.
 *
 * Applied on this side as well as in the API because not every payload arrives
 * pre-sorted: /api/programs/{slug} returns the stored blob untouched, and
 * content that has not been re-saved since the field was added carries no
 * `order` at all. Sorting here means the UI shows one consistent sequence
 * whichever endpoint fed it.
 *
 * An item with no `order` — missing, null, blank, or non-numeric — falls back
 * to its current position, so legacy content keeps exactly the sequence it has
 * today instead of collapsing to 0 and jumping to the front. Array.sort is
 * stable in modern engines, so equal values keep their relative position.
 *
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export function sortByOrder(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => {
      const raw = item?.order;
      const parsed =
        raw === undefined || raw === null || raw === "" ? NaN : Number(raw);

      return {
        item,
        sort: Number.isFinite(parsed) ? parsed : index + 1,
      };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.item);
}

/**
 * Normalizes API response into a single UI-ready shape.
 *
 * Input (from /api/programs/page/{slug}):
 *   data.data.programs_subpage.institutes[]
 *   OR
 *   data.institutes[]
 *
 * Output:
 *   {
 *     institutes: [ { page_slug, tabs: [ { tab_id, tab_label, icon } ] } ],
 *     programs:   [ { ...program, tab_id, institute_slug } ],
 *     categories: [ "undergraduate", "postgraduate" ],
 *     settings:   {}
 *   }
 *
 * Tabs and the programs inside them come out sorted by their admin-set `order`.
 */
export function normalizeProgramsData(rawResponse) {
  const empty = { institutes: [], programs: [], categories: [], settings: {} };

  if (!rawResponse?.data) return empty;

  // Resolve source — handles both nested shapes
  const dataRoot = rawResponse.data?.data || rawResponse.data;
  const source = dataRoot?.programs_subpage || dataRoot;
  const rawInstitutes = source?.institutes || [];

  if (!rawInstitutes.length) return empty;

  // A stable per-institute key. Usually the page_slug, but several institutes
  // can share one page_slug (SAS's 3 faculties are all "sas"); institute_id
  // then keeps them distinct. Falls back to page_slug when absent.
  const instKey = (inst) => inst.institute_id || inst.page_slug || "";

  // Build institutes (main tabs) with their sub-tabs
  const institutes = rawInstitutes.map((inst) => ({
    page_slug: inst.page_slug || "",
    institute_id: instKey(inst),
    institute_label: inst.institute_label || "",
    tabs: sortByOrder(inst.tabs || []).map((tab) => ({
      tab_id: tab.tab_id,
      tab_label: tab.tab_label,
      icon: tab.icon || "",
    })),
  }));

  // Flatten all programs, tagged with tab_id + institute_slug (keyed by
  // institute_id so faculties sharing a page_slug stay separated).
  // The flat list is filtered by tab further down the UI, never re-sorted, so
  // sorting the cards here is what puts them on screen in the admin's order.
  const programs = rawInstitutes.flatMap((inst) =>
    sortByOrder(inst.tabs || []).flatMap((tab) =>
      sortByOrder(tab.programs || []).map((program) => ({
        ...program,
        tab_id: tab.tab_id,
        institute_slug: instKey(inst),
      }))
    )
  );

  // Extract unique categories
  const catSet = new Set();
  programs.forEach((p) => {
    if (p.category) catSet.add(p.category);
  });
  const categories = Array.from(catSet);

  // Settings
  const settings = source?.settings || {};

  return { institutes, programs, categories, settings };
}
