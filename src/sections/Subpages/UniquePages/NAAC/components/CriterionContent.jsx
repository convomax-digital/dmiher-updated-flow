import React from "react";
import KeyIndicatorBlock from "./KeyIndicatorBlock";

const CriterionContent = ({ criterion }) => {
  if (!criterion) {
    return (
      <div className="mt-10 text-center text-gray-500 italic text-lg">
        No content
      </div>
    );
  }

  const { title, keyIndicators = [] } = criterion;

  return (
    <div className="px-6 bg-white max-w-6xl mx-auto">
      <div className="my-10">
        <h2 className="text-3xl font-oswald-medium sm:text-5xl font-[500] text-[#393939] uppercase relative">
          <span className="block border-t-4 border-[#91288D] w-24 mb-4"></span>
          {title}
        </h2>
      </div>

      {keyIndicators.length > 0 ? (
        keyIndicators.map((indicator, idx) => (
          <KeyIndicatorBlock
            key={`${indicator.title || "ki"}-${idx}`}
            title={indicator.title}
            subSections={indicator.subSections}
          />
        ))
      ) : (
        <div className="text-sm text-gray-500 italic">
          No key indicators have been published for this criterion yet.
        </div>
      )}
    </div>
  );
};

export default CriterionContent;
