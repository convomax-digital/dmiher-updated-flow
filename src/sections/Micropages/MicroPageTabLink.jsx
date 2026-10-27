import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MicroPageTabLink = ({ data, college }) => {
  const params = useParams();
  const navigate = useNavigate();

  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
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

  if (!tabs.length) return null;

  const base = college || params.college || params.slug || "";
  const activeKey = params.page;

  const activeTitle = useMemo(() => {
    const match = tabs.find((t) => t.cta_key === activeKey);
    return match?.title || match?.cta_key || tabs[0]?.title || "";
  }, [tabs, activeKey]);

  const go = (ctaKey) => {
    if (!ctaKey || ctaKey === activeKey) return;
    setMobileOpen(false);
    navigate(`/${base}/${ctaKey}`);
  };

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
              const label = tab.title || tab.cta_key;
              if (!label) return null;
              const isActive = tab.cta_key === activeKey;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(tab.cta_key)}
                  className={`tabwise-mobile-item ${isActive ? "tabwise-mobile-item-active" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DESKTOP TABS ===== */}
      <div className="tabwise-tabs" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "1rem",
          }}
        >
          {tabs.map((tab, i) => {
            const label = tab.title || tab.cta_key;
            if (!label) return null;
            const isActive = tab.cta_key === activeKey;
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(tab.cta_key)}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isActive
                    ? "bg-[#91288D] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-[#112a62] hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MicroPageTabLink;
