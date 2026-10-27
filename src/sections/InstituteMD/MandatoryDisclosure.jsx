import { useCallback, useEffect, useMemo, useState } from "react";
import { CardMandatoryDisclosure } from "./CardMandatoryDisclosure";

const capitalize = (text = "") =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

const CardGrid = ({ items }) => {
  const cap = useCallback(capitalize, []);
  if (!items || !items.length) return null;
  return (
    <div className="flex flex-wrap max-w-6xl mx-auto justify-between gap-y-6">
      {items.map((item, index) => (
        <CardMandatoryDisclosure
          key={index}
          {...item}
          name={cap(item.name || "")}
        />
      ))}
    </div>
  );
};

const TabbedCards = ({ tabs }) => {
  const safeTabs = useMemo(
    () => (Array.isArray(tabs) ? tabs.filter(Boolean) : []),
    [tabs]
  );
  const [active, setActive] = useState(0);

  // If tab list shrinks (e.g. data refresh), keep `active` in range.
  useEffect(() => {
    if (active >= safeTabs.length) setActive(0);
  }, [safeTabs.length, active]);

  if (!safeTabs.length) return null;
  const current = safeTabs[active] || safeTabs[0];

  return (
    <div className="max-w-6xl mx-auto">
      <div
        role="tablist"
        aria-label="Mandatory Disclosure tabs"
        className="flex flex-wrap gap-2 mb-6"
      >
        {safeTabs.map((tab, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={tab.slug || tab.name || idx}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(idx)}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold border transition",
                isActive
                  ? "bg-[#91288D] text-white border-[#91288D] shadow"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#91288D] hover:text-[#91288D]",
              ].join(" ")}
            >
              {capitalize(tab.name || tab.slug || `Tab ${idx + 1}`)}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {current.items?.length ? (
          <CardGrid items={current.items} />
        ) : (
          <p className="text-gray-500 text-center py-6">
            No items in this tab yet.
          </p>
        )}
      </div>
    </div>
  );
};

const MandatoryDisclosure = ({ data }) => {
  const title = data?.title || "";
  const layout = data?.layout === "tab_cards" ? "tab_cards" : "simple_cards";
  const items = Array.isArray(data?.items) ? data.items : [];
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];

  const hasContent =
    layout === "tab_cards"
      ? tabs.some((t) => t && Array.isArray(t.items) && t.items.length > 0)
      : items.length > 0;

  if (!hasContent) return null;

  return (
    <section className="bg-[#FAFAF6] py-12">
      <div className="container">
        <h2 className="text-3xl md:text-4xl pt-5 pb-5 font-[500] text-[#555555] font-oswald-medium uppercase mb-5 tracking-wide">
          <hr className="w-16 sm:w-20 border-[#91288D] mb-2 border-t-4" />
          {title}
        </h2>

        {layout === "tab_cards" ? (
          <TabbedCards tabs={tabs} />
        ) : (
          <CardGrid items={items} />
        )}
      </div>
    </section>
  );
};

export default MandatoryDisclosure;
