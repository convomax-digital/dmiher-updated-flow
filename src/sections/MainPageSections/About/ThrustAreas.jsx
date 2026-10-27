import RichTextRenderer from "../../../components/RichTextRenderer";

// "colsXrows" (e.g. "1x2", "2x1") → safe integers.
const parseGridSize = (size) => {
  if (typeof size !== "string") return { cols: 1, rows: 1 };
  const [c, r] = size.toLowerCase().split("x").map((n) => parseInt(n, 10));
  return {
    cols: Number.isFinite(c) && c > 0 ? c : 1,
    rows: Number.isFinite(r) && r > 0 ? r : 1,
  };
};

function ThrustAreas({ data }) {
  const heading = data?.header?.heading || "";
  const bgColor = data?.section_style?.bg_color || "#ebf6ff";

  // Boxes may arrive out of order; render by sort_order to match the mock.
  const boxes = Array.isArray(data?.boxes)
    ? [...data.boxes].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : [];

  // Live-site pattern: the 5-col irregular grid holds the "1x1" and "1x2"
  // thrust cells; the wide "2x1" cells sit below as a separate two-column
  // banner row (National Benchmarks / International Standards). Splitting here
  // lets each part use its own optimal grid without a single-grid balancing
  // hack.
  const gridBoxes = [];
  const bannerBoxes = [];
  for (const box of boxes) {
    const { cols } = parseGridSize(box?.grid_size);
    if (cols >= 2) bannerBoxes.push(box);
    else gridBoxes.push(box);
  }

  return (
    <section
      className="thrust-areas-section"
      style={{ backgroundColor: bgColor }}
    >
      <div className="thrust-areas-container">
        <hr className="thrust-areas-underline" />
        {heading && <h2 className="thrust-areas-title">{heading}</h2>}

        {gridBoxes.length > 0 && (
          <div className="thrust-areas-grid">
            {gridBoxes.map((box, i) => {
              const { cols, rows } = parseGridSize(box?.grid_size);
              const style = {
                gridColumn: `span ${cols}`,
                gridRow: `span ${rows}`,
                backgroundColor: box?.background_color || "#0E2446",
                color: box?.text_color || "#ffffff",
              };
              return (
                <div key={`g-${i}`} className="thrust-areas-box" style={style}>
                  <RichTextRenderer html={box?.description || ""} />
                </div>
              );
            })}
          </div>
        )}

        {bannerBoxes.length > 0 && (
          <div className="thrust-areas-banner">
            {bannerBoxes.map((box, i) => (
              <div
                key={`b-${i}`}
                className="thrust-areas-banner-box"
                style={{
                  backgroundColor: box?.background_color || "#C77ABF",
                  color: box?.text_color || "#0E2446",
                }}
              >
                <RichTextRenderer html={box?.description || ""} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ThrustAreas;
