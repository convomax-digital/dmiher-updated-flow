import { Link, useLocation } from "react-router-dom";

/**
 * Header mega menu: one column per campus group, nothing else.
 *
 * The right-hand preview panel (institute image + description) was removed —
 * the menu is now purely a list of links, so nothing here reads `item.image`
 * or `item.description` any more.
 *
 * The panel is the positioned element itself (see .navbar-mega-menu). It
 * anchors to `.navbar-inner`, the header's max-w-7xl container, NOT to the
 * hovered nav item — matching aiher.edu.in, where the sheet is flush with the
 * right edge of that container whichever menu opened it. Navbar therefore
 * renders mega items without `position: relative` on their wrapper.
 */
const MegaMenu = ({ sections, onItemClick }) => {
  const { pathname } = useLocation();

  // The institute whose page is currently open stays highlighted, so the
  // active institute is always marked. Match the exact slug or any sub-route.
  const norm = (s) => (s || "").replace(/\/+$/, "").toLowerCase();
  const isActive = (slug) => {
    const cur = norm(pathname);
    const target = norm(slug);
    return target && target !== "/" && (cur === target || cur.startsWith(target + "/"));
  };

  const columns = sections?.length || 0;

  return (
    <div className="nav-dropdown-panel navbar-mega-menu">
      <div
        className="navbar-mega-grid"
        style={{
          gridTemplateColumns: `repeat(${columns || 1}, minmax(0, 1fr))`,
        }}
      >
        {sections.map((section) => (
          <div key={section.campus}>
            <h4 className="nav-dropdown-heading">{section.campus}</h4>

            <ul className="nav-dropdown-list">
              {section.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.slug || "/"}
                    onClick={(e) => onItemClick && onItemClick(e, item.slug)}
                    className={`nav-dropdown-item ${
                      isActive(item.slug) ? "is-active" : ""
                    }`}
                    aria-current={isActive(item.slug) ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
