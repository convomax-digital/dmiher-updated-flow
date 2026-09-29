import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import api from "../config/api";
import Seo from "../components/Seo";

/* VIEW ALL page for the home BULLETIN / IMPORTANT ANNOUNCEMENTS sections.
   Reuses the same /bulletins and /announcements endpoints (now returning the
   full per-category list) and mirrors the live-site TheBulletinFilterd layout:
   heading + date filter + tabs + full vertical list. */

// "27th July 2025" -> Date. Ranges ("24th – 26th June 2025") use the start.
const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  return new Date(
    String(dateStr)
      .replace(/(\d+)(st|nd|rd|th)/g, "$1")
      .split("–")[0]
      .trim()
  );
};

const CONFIG = {
  bulletins: {
    endpoint: "/bulletins",
    queryKey: ["bulletins"],
    sectionId: "home_BULLETIN_section",
    heading: "THE BULLETIN",
    bg: "bg-gray-200",
  },
  announcements: {
    endpoint: "/announcements",
    queryKey: ["announcements"],
    sectionId: "home_ANNOUNCEMENTS_section",
    heading: "IMPORTANT ANNOUNCEMENTS",
    bg: "bg-gray-100",
  },
};

export default function NoticeViewAll({ type }) {
  const cfg = CONFIG[type] || CONFIG.bulletins;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Shares react-query's cache with the home section (same key + endpoint).
  const { data: responseData } = useQuery({
    queryKey: cfg.queryKey,
    queryFn: async () => (await api.get(cfg.endpoint)).data,
  });

  const section = Array.isArray(responseData)
    ? responseData.find((s) => s.section_id === cfg.sectionId)
    : responseData;
  const data = section?.data;

  // bulletins -> {tabs, content}; announcements -> {categories, announcements}
  const tabs = data?.tabs || data?.categories || [];
  const content = data?.content || data?.announcements || {};

  const urlTab = searchParams.get("tab");
  // Sync the active tab to ?tab= (or the first tab) once the data resolves.
  if (data && !activeTab && tabs.length) {
    setActiveTab(urlTab && tabs.includes(urlTab) ? urlTab : tabs[0]);
  }

  const items = content[activeTab] || [];

  const filtered = useMemo(() => {
    const list = [...items];
    if (filterType === "latest") {
      return list
        .filter((i) => i.date)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));
    }
    if (filterType === "recent") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return list
        .filter((i) => i.date && parseDate(i.date) >= cutoff)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));
    }
    if (filterType === "custom" && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      return list.filter(
        (i) => i.date && parseDate(i.date) >= start && parseDate(i.date) <= end
      );
    }
    // "all" — keep API order (admin display_order), newest date first where present.
    return list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [items, filterType, fromDate, toDate]);

  const changeTab = (t) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  if (!data) return <div className="min-h-[60vh]" />;

  return (
    <div className={`py-10 px-5 ${cfg.bg} text-gray-500 min-h-[60vh]`}>
      {/* Per-page head tags so this page never inherits another page's meta. */}
      <Seo
        title={
          type === "announcements"
            ? "Important Announcements | DMIHER"
            : "The Bulletin | DMIHER"
        }
      />
      <div className="container">
        {/* Header + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-medium"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            <span className="inline-block w-12 h-1 bg-red-500 mb-2" />
            <br />
            {cfg.heading}
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="latest">Latest First</option>
              <option value="recent">Recent (30 days)</option>
              <option value="custom">Custom Date</option>
            </select>

            {filterType === "custom" && (
              <>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-400 rounded px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-400 rounded px-2 py-1 text-sm"
                />
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-6 gap-4 flex-wrap">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`text-base md:text-xl whitespace-nowrap ${
                activeTab === tab
                  ? "underline text-gray-800 font-semibold"
                  : "hover:text-gray-400"
              } ${index < tabs.length - 1 ? "border-r-2 border-gray-500 pr-4" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Full list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-lg text-gray-500">
            No {activeTab} available
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-8">
            {filtered.map((item, index) => (
              <div
                key={index}
                className="relative pb-3 pr-3 last:after:hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gray-400"
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base md:text-xl hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  <h3 className="text-base md:text-xl">{item.title}</h3>
                )}
                {item.college &&
                  (Array.isArray(item.college) ? (
                    <ul className="list-none italic text-gray-600 space-y-0.5">
                      {item.college.map((name, i) => (
                        <li key={i}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-600">{item.college}</p>
                  ))}
                {item.date && (
                  <p className="text-[#269BFF] text-sm mt-1">{item.date}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
