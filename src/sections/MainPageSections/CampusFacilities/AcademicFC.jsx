import React, { useEffect, useState } from "react";
import { Library } from "lucide-react";
import RichTextRenderer from "../../../components/RichTextRenderer";
import SafeImage from "../../../components/SafeImage";

const AcademicFC = ({ data }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (data?.tabs?.length) {
      setActiveTab(data.tabs[0]?.key);
    }
  }, [data]);

  const activeData = data?.tabs?.find((t) => t.key === activeTab);

  return (
    <section
      className="afc-section"
      style={{
        backgroundColor: data?.basic?.bg_color || "#132F5C",
        color: data?.basic?.text_color || "#ffffff",
      }}
    >
      <div className="container">
        <div className="afc-row">

          {/* ================= LEFT ================= */}
          <div className="afc-left">

            {/* Heading */}
            <div className="afc-heading-wrap">
              <h2 className="afc-heading">
                <hr
                  className="afc-heading-line"
                  style={{
                    borderColor:
                      data?.basic?.accent_color || "#91288D",
                  }}
                />

                {data?.basic?.title}
              </h2>

              <p className="afc-desc">
                {data?.basic?.description}
              </p>
            </div>

            {/* ================= TABS ================= */}
            <div className="afc-tabs">
              {data?.tabs?.map((tab) => (
                <div key={tab.key} className="afc-tab">

                  <button
                    onClick={() =>
                      setActiveTab((prev) =>
                        prev === tab.key ? null : tab.key
                      )
                    }
                    className="afc-tab-btn"
                    style={{
                      color:
                        activeTab === tab.key
                          ? data?.basic?.text_color
                          : data?.basic?.text_color + "CC",
                    }}
                  >
                    <span
                      className={
                        activeTab === tab.key ? "afc-tab-btn-active" : ""
                      }
                    >
                      {tab.title}
                    </span>

                    <span className="afc-tab-toggle">
                      {activeTab === tab.key ? "-" : "+"}
                    </span>
                  </button>

                  {/* Items */}
                  {activeTab === tab.key && (
                    <div className="afc-tab-body">

                      {activeTab === tab.key && tab.description && (
                        <div className="afc-tab-rich">
                          <RichTextRenderer html={tab.description} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="afc-right">

            {activeData ? (
              <SafeImage
                src={activeData.image}
                alt={activeData.title}
                className="afc-right-img"
              />
            ) : (
              <div className="afc-right-empty">
                <div className="afc-right-empty-inner">
                  <Library
                    className="afc-right-empty-icon"
                    style={{
                      color:
                        data?.basic?.accent_color || "#91288D",
                    }}
                  />
                  <span className="afc-right-empty-text">
                    Select a section to view details
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademicFC;
