import { useState, useMemo, useEffect } from "react";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";
import { useProgramFaculty } from "../../context/ProgramFacultyContext";

export default function TabBaseImageContent({ data }) {
  const tabs = useMemo(() => {
    if (!Array.isArray(data?.tabs)) return [];
    return data.tabs;
  }, [data]);

  const [activeIndex, setActiveIndex] = useState(0);
  const { setFacultyKey } = useProgramFaculty();

  const activeTab = tabs[activeIndex];

  // Publish the active tab's faculty key so the "OUR PROGRAMS" section can
  // point its buttons at this faculty (like the live SAS page). Tabs without a
  // program_key (every non-SAS use) leave the shared state untouched.
  useEffect(() => {
    if (activeTab?.program_key) setFacultyKey(activeTab.program_key);
  }, [activeTab?.program_key, setFacultyKey]);

  if (!tabs.length) return null;

  return (
    <div className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {data?.header?.heading && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-oswald-medium font-bold text-[#707070] uppercase mb-8 sm:mb-10">
            <hr className="w-16 border-[#F04E30] mb-3 border-t-4" />
            {data.header.heading}
          </h2>
        )}

        <div className="flex border-b border-gray-200 mb-8 sm:mb-10 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                activeIndex === index
                  ? "text-[#122E5E]"
                  : "text-[#58595B] hover:text-[#122E5E]"
              }`}
            >
              {tab.label}
              {activeIndex === index && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F04E30]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full lg:w-1/2">
            <RichTextRenderer html={activeTab.paragraph} />
          </div>
          <div className="w-full lg:w-1/2">
            <SafeImage
              src={activeTab.image}
              alt={activeTab.label}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
