import RichTextRenderer from "../../../components/RichTextRenderer";

// Live-site badge colors: yellow first three, orange for the fourth. Falls back
// to the array for any additional objectives so the pattern keeps repeating.
const NUMBER_COLORS = ["#91288D", "#91288D", "#91288D", "#E34A2A"];

function CoreObjectives({ data }) {
  const heading = data?.header?.heading || "";
  const subHeading = data?.header?.sub_heading || "";
  const objectives = Array.isArray(data?.objectives) ? data.objectives : [];
  const bgColor = data?.section_style?.bg_color || "#fef4e8";

  if (!heading && !objectives.length) return null;

  return (
    <section
      className="core-objectives-section"
      style={{ backgroundColor: bgColor }}
    >
      <div className="core-objectives-container">
        <hr className="core-objectives-underline" />

        {heading && <h2 className="core-objectives-title">{heading}</h2>}

        {subHeading && (
          <h3 className="core-objectives-subtitle">{subHeading}</h3>
        )}

        {objectives.length > 0 && (
          <div className="core-objectives-grid">
            {objectives.map((item, i) => (
              <div key={i} className="core-objective-item">
                <div className="core-objective-number">
                  <span
                    style={{
                      color: NUMBER_COLORS[i % NUMBER_COLORS.length],
                    }}
                  >
                    {item?.number ?? i + 1}
                  </span>
                </div>
                <div className="core-objective-desc">
                  <RichTextRenderer html={item?.description || ""} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CoreObjectives;
