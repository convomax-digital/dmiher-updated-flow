import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import api from "../config/api";
import { sortByOrder } from "../utils/programs";

/**
 * Fetches /api/programs/{slug} and normalizes the nested
 * `data.data.programs_subpage` payload.
 *
 * Kept separate from `useProgramsData` so existing callers are untouched.
 *
 * This endpoint returns the stored blob as-is — unlike /api/programs/page/
 * it does no sorting of its own — so tabs and their program cards are ordered
 * here, by the `order` the admin sets in the panel.
 */
const fetchMedicinePrograms = async (slug) => {
  const { data } = await api.get(`/programs/${slug}`);
  return data;
};

export const useMedicineProgramsData = (slug) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicine-programs", slug],
    queryFn: () => fetchMedicinePrograms(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const normalized = useMemo(() => {
    const subpage = data?.data?.data?.programs_subpage || {};
    const rawInstitutes = Array.isArray(subpage.institutes)
      ? subpage.institutes
      : [];

    return {
      institutes: rawInstitutes.map((inst) => ({
        ...inst,
        tabs: sortByOrder(inst?.tabs || []).map((tab) => ({
          ...tab,
          programs: sortByOrder(tab?.programs || []),
        })),
      })),
      settings: subpage.settings || {},
    };
  }, [data]);

  return {
    institutes: normalized.institutes,
    settings: normalized.settings,
    // Dashboard-managed SEO metadata + display name of this program page.
    meta: data?.data?.meta || {},
    name: data?.data?.name || "",
    loading: isLoading,
    error: error ? error.message || "Failed to load programs" : null,
  };
};

export default useMedicineProgramsData;
