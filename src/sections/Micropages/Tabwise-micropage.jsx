import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import resolveImage from "../../utils/resolveImage";

const TabMenu = ({ data }) => {
  const tabs = data?.tabs || [];
  const params = useParams();
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allSlugs = useMemo(() => {
    const slugs = [];
    for (const tab of tabs) {
      if (tab.type === "page" && tab.page_slug) slugs.push(tab.page_slug);
      if (tab.type === "dropdown") {
        (tab.items || []).forEach((it) => {
          if (it.page_slug) slugs.push(it.page_slug);
        });
      }
    }
    return slugs;
  }, [tabs]);

  const activeTab = useMemo(() => {
    const urlSlug = params.page;
    if (urlSlug && allSlugs.includes(urlSlug)) return urlSlug;
    return allSlugs[0] || null;
  }, [params.page, allSlugs]);

  const basePath = params.college ? `/${params.college}` : "";

  const activeTitle = useMemo(() => {
    for (const tab of tabs) {
      if (tab.type === "page" && tab.page_slug === activeTab) return tab.title;
      if (tab.type === "dropdown") {
        const match = tab.items?.find((it) => it.page_slug === activeTab);
        if (match) return match.title;
      }
    }
    return tabs[0]?.title || "";
  }, [tabs, activeTab]);

  const handleTabClick = (tab, index) => {
    if (tab.type === "page" && tab.page_slug) {
      setOpenDropdown(null);
      setMobileOpen(false);
      if (tab.page_slug !== params.page) {
        navigate(`${basePath}/${tab.page_slug}`);
      }
      return;
    }

    if (tab.type === "pdf" && tab.pdf) {
      window.open(resolveImage(tab.pdf), "_blank");
      return;
    }

    if (tab.type === "dropdown") {
      setOpenDropdown(openDropdown === index ? null : index);
    }
  };

  const handleDropdownItem = (item) => {
    setOpenDropdown(null);
    setMobileOpen(false);

    if (item.type === "pdf" && item.pdf) {
      window.open(resolveImage(item.pdf), "_blank");
      return;
    }

    if (item.page_slug && item.page_slug !== params.page) {
      navigate(`${basePath}/${item.page_slug}`);
    }
  };

  const isTabActive = (tab) => {
    if (tab.type === "page") return activeTab === tab.page_slug;
    if (tab.type === "dropdown")
      return tab.items?.some((item) => item.page_slug === activeTab);
    return false;
  };

  if (!tabs.length) return null;

  return (
    <>
      {/* ===== MOBILE DROPDOWN ===== */}
      <div className="tabwise-mobile-select" ref={mobileRef}>
        <button
          type="button"
          className="tabwise-mobile-trigger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="truncate">{activeTitle}</span>
          <svg
            className={`w-5 h-5 shrink-0 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mobileOpen && (
          <div className="tabwise-mobile-list">
            {tabs.map((tab, i) => {
              if (!tab.title) return null;

              if (tab.type === "dropdown") {
                return (
                  <div key={i}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                      {tab.title}
                    </div>
                    {tab.items?.map((item, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleDropdownItem(item)}
                        className={`tabwise-mobile-item ${
                          activeTab === item.page_slug ? "tabwise-mobile-item-active" : ""
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTabClick(tab, i)}
                  className={`tabwise-mobile-item ${
                    isTabActive(tab) ? "tabwise-mobile-item-active" : ""
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DESKTOP TABS ===== */}
      <div className="tabwise-tabs">
        {tabs.map((tab, i) => {
          if (!tab.title) return null;

          return (
            <div key={i} className="relative">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isTabActive(tab)
                    ? "bg-[#91288D] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-[#112a62] hover:text-white"
                }`}
                onClick={() => handleTabClick(tab, i)}
              >
                {tab.title}
                {tab.type === "dropdown" && (
                  <span className="ml-1 text-xs">▾</span>
                )}
              </button>

              {tab.type === "dropdown" && openDropdown === i && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border rounded shadow-lg z-50">
                  {tab.items?.map((item, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => handleDropdownItem(item)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        activeTab === item.page_slug
                          ? "bg-orange-50 text-[#91288D] font-semibold"
                          : ""
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TabMenu;
