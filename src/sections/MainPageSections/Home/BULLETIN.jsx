import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "../../../components/icons";
import api from "../../../config/api";

// Cached fetch — react-query re-uses the response across every mount during
// its staleTime window (5 min in entry-client.jsx). The old useEffect +
// api.get pattern re-hit /api/bulletins every time the user navigated back
// to home, flashed the null → data skeleton, and helped push the API into
// its 429 rate limit under normal browsing.
const fetchBulletins = async () => {
  const { data } = await api.get("/bulletins");
  return data;
};

function HomeBulletin() {
  const [activeTab, setActiveTab] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: responseData } = useQuery({
    queryKey: ["bulletins"],
    queryFn: fetchBulletins,
  });

  // Response can be a bare section object or an array of sections; the
  // section_id filter picks the right one out of the array shape without
  // breaking the direct-object shape.
  const section = Array.isArray(responseData)
    ? responseData.find((item) => item.section_id === "home_BULLETIN_section")
    : responseData;

  const data = section?.data;

  // Once the query resolves and we know the tabs list, sync activeTab to
  // the first entry — but only if the user hasn't already picked one, so
  // their tab choice sticks across re-renders.
  if (data && !activeTab && data.tabs?.[0]) {
    setActiveTab(data.tabs[0]);
  }

  if (!data) return null;

  const { title, tabs = [], content = {}, items_per_page = 4 } = data;

  const currentItems = content[activeTab] || [];
  const visibleItems = currentItems.slice(
    currentIndex,
    currentIndex + items_per_page,
  );

  return (
    // Markup mirrors the live-site THE BULLETIN section (fonts / UI / spacing).
    <div className="py-10 px-5 bg-gray-200 text-gray-500">
      <div className="container">
        <h2
          className="text-2xl font-[500] sm:text-3xl lg:text-4xl"
          style={{ fontFamily: "Oswald, sans-serif" }}
        >
          <span className="inline-block w-12 h-1 bg-red-500 mb-2" />
          <br />
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
          {/* Tabs */}
          <div className="flex-1 flex md:ml-20 justify-center">
            <div className="flex space-x-4 flex-wrap justify-center max-w-full overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentIndex(0);
                  }}
                  className={`text-base md:text-xl whitespace-nowrap ${
                    activeTab === tab ? "underline" : "hover:text-gray-400"
                  } ${
                    index < tabs.length - 1
                      ? "border-r-2 border-gray-500 pr-4"
                      : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
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
              to={`/bulletin?tab=${encodeURIComponent(activeTab)}`}
              className="text-[#91288D] font-semibold text-sm ml-1 cursor-pointer hover:underline whitespace-nowrap"
            >
              VIEW ALL
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 sm:pt-8 max-w-full grid lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className="border-0 md:border-r md:pr-3 last:border-0"
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base md:text-xl cursor-pointer text-[#555555] leading-tight hover:underline block"
                  style={{
                    fontFamily: '"Helvetica LT Std", "Condensed", sans-serif',
                  }}
                >
                  {item.title}
                </a>
              ) : (
                <h3
                  className="text-base md:text-xl cursor-pointer hover:underline text-[#555555] leading-tight"
                  style={{
                    fontFamily: '"Helvetica LT Std", "Condensed", sans-serif',
                  }}
                >
                  {item.title}
                </h3>
              )}

              {item.college && (
                <p className="text-base text-gray-600 italic">{item.college}</p>
              )}

              {item.date && (
                <p className="text-base text-[#269BFF]">{item.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeBulletin;
