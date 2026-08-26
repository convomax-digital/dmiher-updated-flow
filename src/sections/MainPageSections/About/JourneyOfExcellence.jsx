import RichTextRenderer from "../../../components/RichTextRenderer";

function JourneyOfExcellence({ data }) {
  const heading = data?.header?.heading || "";
  const description = data?.header?.description || "";

  const timelineTitle = data?.timeline?.title || "";
  const timelineItemsRaw = Array.isArray(data?.timeline?.items)
    ? data.timeline.items
    : [];
  // API lists newest → oldest; the staircase reads oldest (bottom-left) →
  // newest (top-right), so reverse for display.
  const timelineItems = [...timelineItemsRaw].reverse();

  const dispHeading = data?.dispensation?.heading || "";
  const dispDescription = data?.dispensation?.description || "";

  const flowColumns = Array.isArray(data?.flow_chart?.columns)
    ? data.flow_chart.columns
    : [];

  const bgColor = data?.section_style?.bg_color || "#ffffff";

  return (
    <section
      className="joe-section"
      style={{ backgroundColor: bgColor }}
    >
      <div className="joe-container">
        {heading && (
          <h2 className="joe-title">
            <hr className="joe-underline" />
            {heading}
          </h2>
        )}
        {description && <p className="joe-description">{description}</p>}

        {(timelineTitle || timelineItems.length > 0) && (
          <div className="joe-timeline-wrapper">
            {timelineTitle && (
              <div className="joe-timeline-header">
                <h3 className="joe-timeline-title">{timelineTitle}</h3>
                <span className="joe-timeline-line" />
              </div>
            )}

            {timelineItems.length > 0 && (
              <div className="joe-timeline-staircase">
                {timelineItems.map((item, i, arr) => (
                  <div
                    key={i}
                    className="joe-timeline-step"
                    style={{
                      backgroundColor: item?.background || "#0E2D5B",
                      color: item?.text_color || "#ffffff",
                      // Staircase rise: live site steps each card's TOP up by
                      // exactly 90px toward the newest item (cards then grow
                      // downward with their content). Applied via margin-top
                      // on desktop only (see .joe-timeline-step CSS).
                      "--joe-step-rise": `${(arr.length - 1 - i) * 90}px`,
                    }}
                  >
                    <RichTextRenderer html={item?.title || ""} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(dispHeading || dispDescription) && (
          <div className="joe-dispensation">
            {dispHeading && (
              <h3 className="joe-dispensation-title">
                {dispHeading}
                <span className="joe-dispensation-line" />
              </h3>
            )}
            {dispDescription && (
              <RichTextRenderer
                className="joe-dispensation-body"
                html={dispDescription}
              />
            )}
          </div>
        )}

        {flowColumns.length > 0 && (
          <div className="joe-flow-chart">
            {flowColumns.map((col, ci) => (
              <div
                key={ci}
                className="joe-flow-col"
                style={{ backgroundColor: col?.background || "#FFFBEB" }}
              >
                {col?.heading && (
                  <div className="joe-flow-heading">{col.heading}</div>
                )}
                <div className="joe-flow-items">
                  {(col?.items || []).map((item, ii) => (
                    <div
                      key={ii}
                      className="joe-flow-item"
                      style={{
                        backgroundColor: item?.background || "#0F2B57",
                        color: item?.text_color || "#ffffff",
                      }}
                    >
                      {item?.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JourneyOfExcellence;
