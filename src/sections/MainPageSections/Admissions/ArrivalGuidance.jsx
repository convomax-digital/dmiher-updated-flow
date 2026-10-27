import { useState } from "react";
import RichTextRenderer from "../../../components/RichTextRenderer";

const ArrivalGuidance = ({ data }) => {
  const heading = data?.header?.heading || "";
  const description = data?.header?.description || "";
  const tabs = data?.tabs || [];
  const stepsSection = data?.steps_section || {};
  const steps = stepsSection.steps || [];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeTab = tabs[activeIdx];

  return (
    <div className="bg-[#269BFF]/10 px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-center container">
        <div className="w-full pb-6 lg:pb-10">
          {heading && (
            <div className="mb-2">
              <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-normal text-[#555555] font-[600] whitespace-pre-line">
                <div className="border-t-4 border-[#7E2279] w-20 mb-2"></div>
                {heading}
              </h2>
            </div>
          )}
          {description && (
            <p className="text-gray-500 text-base font-oswald font-[400] mb-6">
              {description}
            </p>
          )}

          {tabs.length > 0 && (
            <>
              <div className="flex border-b border-gray-300 mb-6 gap-6 text-xl font-oswald-medium">
                {tabs.map((tab, i) => (
                  <button
                    key={i}
                    className="pb-2 relative text-[#555555]"
                    onClick={() => setActiveIdx(i)}
                  >
                    {tab.label}
                    {activeIdx === i && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#7E2279]"></div>
                    )}
                  </button>
                ))}
              </div>

              {activeTab?.note && (
                <div>
                  <RichTextRenderer html={activeTab.note} />
                </div>
              )}
            </>
          )}

          {steps.length > 0 && (
            <div className="mt-15">
              {stepsSection.heading && (
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-normal text-[#555555] font-[600]">
                    <div className="border-t-4 border-[#7E2279] w-20 mb-2"></div>
                    {stepsSection.heading}
                  </h2>
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center">
                    <div className="bg-white mb-5 md:mb-0 px-10 py-6 shadow-sm font-oswald-medium">
                      <div className="text-xl text-[#555555] font-light">
                        <RichTextRenderer html={step.note || ""} />
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block">
                        <div className="w-8 h-8 bg-[#13294B] rounded-full flex items-center justify-center text-white font-bold mx-2">
                          →
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrivalGuidance;
