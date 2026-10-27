import React from "react";
import resolveImage from "../../../utils/resolveImage";

export default function InternationalCollaborations({ data }) {
  const { basic = {}, stats = [] } = data || {};

  return (
    <div
      className="relative text-white px-4 py-10 md:py-20"
          style={{
              backgroundColor: "#132F5C",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "70%",
        backgroundImage: `url(${resolveImage(basic?.background_image)})`,
      }}
    >
      {/* Heading */}
      <div className="intl-collab-heading-wrap">
        <h2 className="intl-collab-heading">
          <hr className="intl-collab-heading-line" />
          {basic?.title}
        </h2>
      </div>

      {/* Stats Section */}
      <div className="intl-collab-stats-wrap">
        {/* Desktop Version */}
        <div className="intl-collab-desktop">
          <div className="intl-collab-axis"></div>

          <div className="intl-collab-grid">
            {stats.map((item, idx) => (
              <div key={idx} className="intl-collab-cell">
                {/* Connecting Line */}
                {item.position === "top" ? (
                  <div
                    className="intl-collab-line-top"
                    style={{ right: idx === stats.length - 1 ? "8px" : 0 }}
                  ></div>
                ) : (
                  <div
                    className="intl-collab-line-bottom"
                    style={{ right: idx === stats.length - 1 ? "8px" : 0 }}
                  ></div>
                )}

                {/* Data Block */}
                <div
                  className={`intl-collab-data ${
                    item.position === "top"
                      ? "intl-collab-data-top"
                      : "intl-collab-data-bottom"
                  }`}
                >
                  <div
                    className="intl-collab-number"
                    style={{ color: item.color }}
                  >
                    {item.number}
                  </div>

                  <div className="intl-collab-label">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Version */}
        <div className="intl-collab-mobile">
          {stats.map((item, idx) => (
            <div key={idx} className="intl-collab-mobile-item">
              <div
                className="intl-collab-mobile-num"
                style={{ color: item.color }}
              >
                {item.number}
              </div>

              <div className="intl-collab-mobile-label">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
