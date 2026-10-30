import { Link, useLocation } from "react-router-dom";

/**
 * Header mega menu: one column per campus group, nothing else.
 *
 * The right-hand preview panel (institute image + description) was removed —
 * the menu is now purely a list of links, so nothing here reads `item.image`
 * or `item.description` any more.
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
    <div
      // Width follows the number of campus groups instead of the old fixed
      // 850/1100px, which was sized around the preview panel that used to
      // occupy the third column.
      className="absolute top-[65%] left-1/2 -translate-x-1/2 mt-3 grid gap-4 w-max max-w-[90vw] bg-white text-[#1f3c88] shadow-lg p-6 z-[9999] transition-all duration-300 ease-in-out"
      style={{ gridTemplateColumns: `repeat(${columns || 1}, minmax(0, 1fr))` }}
    >
      {sections.map((section) => (
        <div key={section.campus} className="px-4 min-w-[220px]">
          <h4 className="text-md font-semibold mb-2 underline">
            {section.campus}
          </h4>

          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.slug || "/"}
                  onClick={(e) => onItemClick && onItemClick(e, item.slug)}
                  className={`text-sm font-semibold block transition-colors duration-200 ${
                    isActive(item.slug)
                      ? "text-[#91288D]"
                      : "text-[#555555] hover:text-[#91288D]"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MegaMenu;
