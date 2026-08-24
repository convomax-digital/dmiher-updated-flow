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
    tabs: (inst.tabs || []).map((tab) => ({
      tab_id: tab.tab_id,
      tab_label: tab.tab_label,
      icon: tab.icon || "",
    })),
  }));

  // Flatten all programs, tagged with tab_id + institute_slug (keyed by
  // institute_id so faculties sharing a page_slug stay separated).
  const programs = rawInstitutes.flatMap((inst) =>
    (inst.tabs || []).flatMap((tab) =>
      (tab.programs || []).map((program) => ({
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
