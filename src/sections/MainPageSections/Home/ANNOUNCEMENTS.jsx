import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "../../../components/icons";
import api from "../../../config/api";

// Cached fetch — react-query re-uses the response across every mount of
// HomeANNOUNCEMENTS during its staleTime window (5 min by default in
// entry-client.jsx's QueryClient config). Before this we called
// api.get("/announcements") inside a useEffect on every mount, so
// navigating away from home and back re-fetched every time, flashed the
// null → data skeleton, and contributed to the /api/announcements 429s
// live users were hitting.
const fetchAnnouncements = async () => {
  const { data } = await api.get("/announcements");
  return data;
};

function HomeANNOUNCEMENTS() {
  const [activeCategory, setActiveCategory] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: responseData } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  // Response is either the section object directly or an array of section
  // objects — the section_id filter picks the right one out of the array
  // shape without breaking the direct-object shape.
  const section = Array.isArray(responseData)
    ? responseData.find(
        (item) => item.section_id === "home_ANNOUNCEMENTS_section"
      )
    : responseData;

  const data = section?.data;

  // Once the query resolves and we know the categories list, sync
  // activeCategory to the first entry (only if the user hasn't already
  // picked one, so their tab choice sticks across re-renders).
  if (data && !activeCategory && data.categories?.[0]) {
    setActiveCategory(data.categories[0]);
  }

  if (!data) return null;

  const {
    title,
    categories = [],
    announcements = {},
    items_per_page = 4,
  } = data;

  const currentItems = announcements[activeCategory] || [];
  const visibleItems = currentItems.slice(
    currentIndex,
    currentIndex + items_per_page,
  );

  return (
    // Markup mirrors the live-site IMPORTANT ANNOUNCEMENTS section.
    <div className="py-8 pb-10 bg-white text-gray-500">
      <div className="container pb-10">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-medium"
          style={{ fontFamily: "Oswald, sans-serif" }}
        >
          <span className="inline-block w-12 h-1 bg-red-500 mb-2" />
          <br />
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm text-gray-600 gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center sm:ml-auto sm:mr-auto space-x-2">
            {categories.map((cat, index) => (
              <span
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentIndex(0);
                }}
                className={`cursor-pointer text-base sm:text-lg transition-colors px-2 ${
                  activeCategory === cat
                    ? "underline text-gray-800 font-semibold"
                    : "hover:text-gray-500"
                } ${
                  index < categories.length - 1
                    ? "border-r border-gray-400"
                    : ""
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Slider arrows + VIEW ALL */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                setCurrentIndex((p) => Math.max(p - items_per_page, 0))
              }
              disabled={currentIndex === 0}
              aria-label="Previous"
              className="rounded-full border border-gray-400 p-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((p) => p + items_per_page)}
              disabled={currentIndex + items_per_page >= currentItems.length}
              aria-label="Next"
              className="rounded-full border border-gray-500 p-2 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <ArrowRight size={20} />
            </button>
            <Link
              to={`/announcements?tab=${encodeURIComponent(activeCategory)}`}
              className="text-[#91288D] font-semibold text-sm ml-1 cursor-pointer hover:underline whitespace-nowrap"
            >
              VIEW ALL
            </Link>
          </div>
        </div>

        {/* Content — 4-up on desktop so a full page fills every column. */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 pt-6 sm:pt-8">
          {visibleItems.map((item, index) => (
            <ul
              key={index}
              className="text-[#555555] max-lg:border-b max-lg:pb-2 lg:border-r max-lg:border-gray-200 border-gray-300 last:border-b-0 sm:last:border-r-0 pr-6 pl-6 pb-4 sm:pb-0"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg sm:text-sm leading-relaxed hover:text-gray-900 hover:underline transition-colors cursor-pointer block"
              >
                {item.title}
              </a>

              {item.college &&
                (Array.isArray(item.college) ? (
                  <ul className="mt-2 list-none text-xs text-gray-500 space-y-1">
                    {item.college.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs mt-1 text-gray-500">{item.college}</p>
                ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeANNOUNCEMENTS;
