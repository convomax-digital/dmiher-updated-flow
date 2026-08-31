import React, { useState } from "react";
import AboutHospitalTabBody from "./TabBody";
import { flattenNumericKeys } from "./utils";

/**
 * Renders for section_id `about_hospital_subpage`.
 * Single section: main heading + tabs[]. Each tab carries
 * `tab_name` + `tab_type` + content. Active tab is internal state.
 */
const AboutHospital = ({ data }) => {
  // Some responses double-wrap the section payload: data = { slug, cta_key,
  // sections: [{ section_id: "about_hospital_subpage", data: { header, tabs } }] }
  // (seen on mgac/hospital) instead of { header, tabs } directly. Unwrap the
  // inner data so both shapes render.
  const nested =
    !Array.isArray(data?.tabs) && Array.isArray(data?.sections)
      ? data.sections.find((s) => s?.section_id === "about_hospital_subpage")
          ?.data
      : null;
  const d = nested || data;

  const header = flattenNumericKeys(d?.header);
  const mainHeading = header?.main_heading;
  const headingType = header?.heading_type || "full";
  const tabs = Array.isArray(d?.tabs) ? d.tabs : [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (tabs.length === 0) return null;

  const activeTab = tabs[activeIdx] || tabs[0];

  return (
    <div className="ah-page">
      {mainHeading && (
        headingType === "normal" ? (
          <h2 className="heading">
            <hr className="heading-line" />
            {mainHeading}
          </h2>
        ) : (
          <h1 className="ah-page-h1">
            {mainHeading}
          </h1>
        )
      )}

      <div className="ah-tabs-row">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`ah-tab-btn ${
              activeIdx === idx ? "ah-tab-btn-active" : "ah-tab-btn-inactive"
            }`}
            role="tab"
            aria-selected={activeIdx === idx}
          >
            {tab.tab_name}
          </button>
        ))}
      </div>

      <AboutHospitalTabBody tab={activeTab} />
    </div>
  );
};

export default AboutHospital;
