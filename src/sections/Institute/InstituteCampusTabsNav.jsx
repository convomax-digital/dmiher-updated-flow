import React from "react";
import { Link, useLocation } from "react-router-dom";


function InstituteCampusTabsNav({ data }) {
  const { pathname } = useLocation();

  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
  if (!tabs.length) return null;

  // Live-site variants — adapt by tab count
  const isMulti = tabs.length >= 3;
  const gapClass     = isMulti ? "gap-[4%] md:gap-[8%]"  : "gap-[8%] md:gap-[15%]";
  const textSize     = isMulti ? "text-lg md:text-xl"    : "text-lg md:text-2xl";
  const maxWidth     = isMulti ? "max-w-[440px]"         : "max-w-[800px]";
  const activeWeight = isMulti ? "font-[500]"            : "font-bold";


  const currentSlug = pathname.split("/").filter(Boolean)[0]?.toLowerCase() || "";

  return (
    <ul
      className={`container flex items-center font-oswald-medium justify-center ${gapClass} border-b my-8 w-fit m-auto max-sm:flex-col max-sm:gap-0 max-sm:border-b-0`}
    >
      {tabs.map((tab, idx) => {
        // Accept both shapes: {label, page_slug} (canonical) and
        // {name, url, active_for_slug} (some seeds).
        const label = tab.label || tab.name || "";
        const rawSlug =
          tab.page_slug ||
          tab.active_for_slug ||
          (tab.url || "").replace(/^\/+/, "");
        const slug = rawSlug.toLowerCase();
        const href = tab.url || `/${rawSlug}`;
        const isActive = slug === currentSlug;
        return (
          <li
            key={idx}
            className={`cursor-pointer text-center ${textSize} py-4 ${maxWidth} max-sm:w-full max-sm:border-b ${
              isActive
                ? `${activeWeight} text-[#132F5C] border-b-4 border-[#91288D]`
                : "text-[#555555]"
            }`}
          >
            <Link
              to={href}
              className="block w-full h-full px-2"
              onClick={() => {
                if (!isActive) {
                  sessionStorage.setItem("manualTabNavigation", "true");
                }
              }}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default InstituteCampusTabsNav;
