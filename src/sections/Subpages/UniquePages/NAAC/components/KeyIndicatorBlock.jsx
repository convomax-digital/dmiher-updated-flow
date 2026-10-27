import React from "react";
import SubSectionTable from "./SubSectionTable";

const KeyIndicatorBlock = ({ title, subSections }) => {
  if (!title && !(subSections && subSections.length)) return null;

  return (
    <div className="my-2">
      {title ? (
        <h3 className="text-2xl text-[#393939] my-5 font-oswald-medium">
          {title}
        </h3>
      ) : null}
      <SubSectionTable subSections={subSections} />
    </div>
  );
};

export default KeyIndicatorBlock;
