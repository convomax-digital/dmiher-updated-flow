import React, { useState } from "react";
import { Library } from "lucide-react";
import SafeImage from "../../../components/SafeImage";
import resolveImage from "../../../utils/resolveImage";
import RichTextRenderer from "../../../components/RichTextRenderer";

/**
 * CampusLifeAcademic — dark-blue panel: left title + description + accordion
 * tabs; right: image of the currently-open tab.
 *
 * Data shape:
 *   basic: { title, description }
 *   tabs:  [{ title, description (HTML), image }]
 */
const CampusLifeAcademic = ({ data }) => {
  const basic = data?.basic || {};
  const title = basic.title || data?.title;
  const description = basic.description || data?.description;
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];

  // First tab open by default; -1 = all collapsed.
  const [activeIdx, setActiveIdx] = useState(0);

  const bg = data?.section_style?.bg_color || data?.bg_color || "#132F5C";
  const accent = data?.accent_color || "#91288D";

  if (!tabs.length) return null;

  const openTab = activeIdx >= 0 ? tabs[activeIdx] : tabs[0];
  const activeImage = openTab?.image;

  return (
    <section className="cla-section" style={{ backgroundColor: bg, color: "#fff" }}>
      <div className="container">
        <div className="cla-row">
          <div className="cla-left">
            <div className="cla-head">
              <h2 className="cla-heading">
                <hr className="cla-heading-line" style={{ borderColor: accent }} />
                {title}
              </h2>
              {description && <p className="cla-desc">{description}</p>}
            </div>

            <div className="cla-tabs">
              {tabs.map((tab, idx) => {
                const isOpen = activeIdx === idx;
                return (
                  <div key={idx} className="cla-tab">
                    <button
                      onClick={() => setActiveIdx((p) => (p === idx ? -1 : idx))}
                      className="cla-tab-btn"
                    >
                      {tab.title}
                      <span>{isOpen ? "−" : "+"}</span>
                    </button>

                    {isOpen && tab.description && (
                      <div className="cla-items">
                        <RichTextRenderer html={tab.description} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cla-right">
            {activeImage ? (
              <SafeImage
                src={resolveImage(activeImage)}
                alt={openTab?.title || "Academic facility"}
                className="cla-img"
              />
            ) : (
              <div className="cla-empty">
                <Library className="cla-empty-icon" style={{ color: accent }} />
                <span>Select a section to view details</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampusLifeAcademic;
