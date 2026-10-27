import { useState } from "react";
import RichTextRenderer from "../../../components/RichTextRenderer";

const DALKeyFunctions = ({ data }) => {
  const heading = data?.heading || "";
  const description = data?.description || "";
  const tabs = data?.tabs || [];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeTab = tabs[activeIdx];

  if (!tabs.length) return null;

  return (
    <div className="bg-[#f0efef] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h1 className="text-3xl md:text-4xl font-[500] mb-5 font-oswald-medium text-[#555555] text-left">
            <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4 lg:mx-0" />
            <RichTextRenderer html={heading} />
          </h1>
        )}

        {description && (
          <p className="text-gray-600 text-sm font-light max-w-4xl text-left mx-auto lg:mx-0">
            {description}
          </p>
        )}

        <div className="border-b border-gray-400 flex flex-wrap justify-center lg:justify-start gap-10 md:gap-20 mt-6 text-[17px] font-[300] font-oswald-medium text-gray-600">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="relative w-[9rem] text-center lg:text-left break-words"
            >
              <button
                onClick={() => setActiveIdx(index)}
                className={`pb-2 w-full whitespace-normal break-words transition-all duration-300 min-h-[3.5rem] ${
                  activeIdx === index ? "text-[#132F5C] font-[600]" : ""
                }`}
              >
                {(tab.name || []).map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </button>
              {activeIdx === index && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 lg:left-[0.3rem] lg:translate-x-0 w-[90%] h-[3px] bg-[#132F5C]" />
              )}
            </div>
          ))}
        </div>

        {activeTab && (
          <div className="mt-6 text-gray-800 text-base font-light leading-10 max-w-4xl mx-auto lg:mx-0 text-left">
            <ul className="list-disc pl-5">
              {(activeTab.content || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DALKeyFunctions;
