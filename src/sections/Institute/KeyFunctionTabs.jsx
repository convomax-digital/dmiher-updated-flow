import { useEffect, useState, useMemo } from "react";
import RichTextRenderer from "../../components/RichTextRenderer";

export default function KeyFunctionTabs({ data }) {

  // Transform API → Tabs
  const tabs = useMemo(() => {
    if (!Array.isArray(data?.dimensions)) return [];

    return data.dimensions.map((item, index) => ({
      name: item.title
        ? splitTitle(item.title)
        : ["Ph.D. Programs", "Management"], // fallback
      desc: item.desc, // keep HTML as-is
    }));
  }, [data]);

  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    if (!activeTab && tabs.length > 0) {
      setActiveTab(tabs[0]);
    }
  }, [activeTab, tabs]);

  if (!tabs.length) return null;

  return (
    <div className="bg-[#f0efef] font-[Arial] py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-[500] mb-5 text-[#555555]">
          <hr className="w-16 border-[#91288D] mb-3 border-t-4" />
          {data?.header?.title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm max-w-4xl">
          {data?.header?.description}
        </p>

        {/* Tabs */}
        <div className="inst-keyfn-tabs">
          {tabs.map((tab, index) => (
            <div key={index} className="relative w-[9rem]">
              <button
                onClick={() => setActiveTab(tab)}
                className={`pb-2 w-full min-h-[3.5rem] ${
                  activeTab?.name[0] === tab.name[0]
                    ? "text-[#132F5C] font-semibold"
                    : ""
                }`}
              >
                {tab.name.map((line, i) => (
                  <h2 key={i}>{line}</h2>
                ))}
              </button>

              {/* Active underline */}
              {activeTab?.name[0] === tab.name[0] && (
                <div className="absolute bottom-0 left-0 w-[90%] h-[3px] bg-[#132F5C]" />
              )}
            </div>
          ))}
        </div>

        {/* Content (HTML Render) */}
        <div className="mt-6 text-gray-800 text-base leading-8 max-w-4xl">
          {/* <div
            dangerouslySetInnerHTML={{ __html: activeTab?.desc }}
          /> */}
          <RichTextRenderer html={activeTab?.desc} />
        </div>

      </div>
    </div>
  );
}

//
// Helper
//
function splitTitle(title) {
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);

  return [
    words.slice(0, mid).join(" "),
    words.slice(mid).join(" "),
  ];
}
