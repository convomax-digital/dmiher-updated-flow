import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { useProgramFaculty } from "../../context/ProgramFacultyContext";

function ProgramsSection({ data, college }) {
  const { header, programs } = data || {};

  // Resolve college slug: prop → URL fallback
  const locationSlug = useLocation().pathname.split("/")[1];
  const instituteSlug = college || locationSlug;

  // When a faculty tab is active (SAS), buttons open that faculty's listing.
  const { facultyKey } = useProgramFaculty();

  if (!programs?.length) return null;

  /**
   * Flatten programs → one card per category.
   *
   * API gives:  [{ category: ["undergraduate", "postgraduate"] }]
   * We need:    [{ category: "undergraduate" }, { category: "postgraduate" }]
   *
   * Each category becomes its own clickable card linking to:
   *   /{college}/programs/{category}
   */
  const categoryCards = programs.flatMap((program) => {
    const cats = Array.isArray(program.category)
      ? program.category
      : [program.category].filter(Boolean);

    return cats.map((cat) => {
      const base = ROUTES.programsByCategory(instituteSlug, cat);
      return {
        label: cat.charAt(0).toUpperCase() + cat.slice(1), // "undergraduate" → "Undergraduate"
        category: cat,
        // ?f=<faculty> makes the listing faculty-specific (live SAS behaviour).
        link: facultyKey ? `${base}?f=${encodeURIComponent(facultyKey)}` : base,
      };
    });
  });

  if (!categoryCards.length) return null;

  return (
    <div className="inst-prog-section">
      <div className="container">
        <h2 className="heading">
          <hr className="heading-line" />
          {header?.heading}
        </h2>

        {/* Mobile */}
        <ul className="inst-prog-mobile">
          {categoryCards.map((card) => (
            <li
              key={card.category}
              className="clip-path-message group cursor-pointer"
            >
              <Link to={card.link}>
                <span className="clip-path-message-inner">
                  <span className="inst-prog-mobile-text">
                    {card.label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop */}
        <div className="inst-prog-desktop">
          <ul className="inst-prog-desktop-list container">
            {categoryCards.map((card) => (
              <li
                key={card.category}
                className="clip-path-message group cursor-pointer"
              >
                <Link to={card.link}>
                  <span className="clip-path-message-inner">
                    <span className="inst-prog-desktop-text">
                      {card.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProgramsSection;
