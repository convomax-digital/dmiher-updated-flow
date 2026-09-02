// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// const MegaMenu = ({ sections }) => {
//   const [hoveredItem, setHoveredItem] = useState(null);

//   return (
//     <div className="mega-menu">
//       <div className="mega-menu-left">
//         {sections.map((section) => (
//           <div key={section.campus}>
//             <h4 className="mega-heading">{section.campus}</h4>

//             <ul className="mega-list">
//               {section.items.map((item) => (
//                 <li key={item.id}>
//                   <Link
//                     to={item.slug || "/"}
//                     onMouseEnter={() => setHoveredItem(item)}
//                     className="mega-link"
//                   >
//                     {item.title}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>

//       <div className="mega-preview">
//         {hoveredItem ? (
//           <>
//             <img
//               src={hoveredItem.image}
//               alt={hoveredItem.title}
//               className="mega-preview-img"
//             />
//             <p>{hoveredItem.title}</p>
//             <p>{hoveredItem.description}</p>
//           </>
//         ) : (
//           <p>Hover on institute to preview</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MegaMenu;




import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const MegaMenu = ({ sections, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const { pathname } = useLocation();

  // The institute whose page is currently open stays highlighted in red
  // (the same colour the links get on hover), so the active institute is
  // always marked in the mega menu. Match the exact slug or any sub-route.
  const norm = (s) => (s || "").replace(/\/+$/, "").toLowerCase();
  const isActive = (slug) => {
    const cur = norm(pathname);
    const target = norm(slug);
    return target && target !== "/" && (cur === target || cur.startsWith(target + "/"));
  };

  // Preview priority: the hovered link → the active institute (the page you're
  // currently on) → the very first institute as a sensible default, so the
  // right panel never sits empty ("Hover on institute to preview"). Hovering
  // any link still overrides it via hoveredItem.
  const allItems = (sections || []).flatMap((s) => s.items || []);
  const activeInstitute = allItems.find((it) => isActive(it.slug));
  const firstInstitute = allItems.find((it) => it.image) || allItems[0];
  const preview = hoveredItem || activeInstitute || firstInstitute;

  return (
    <div className="absolute top-[65%] left-1/2 -translate-x-1/2 mt-3 grid grid-cols-3 xl:grid-cols-3 gap-4 bg-white text-[#1f3c88] shadow-lg p-6 z-[9999] w-[850px] xl:w-[1100px] justify-between transition-all duration-300 ease-in-out">
      {/* Left Section */}
      <div className="contents">
        {sections.map((section) => (
          <div key={section.campus} className="px-4">
            <h4 className="text-md font-semibold mb-2 underline">
              {section.campus}
            </h4>

            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.slug || "/"}
                    onMouseEnter={() => setHoveredItem(item)}
                    onClick={(e) => onItemClick && onItemClick(e, item.slug)}
                    className={`text-sm font-semibold block transition-colors duration-200 ${
                      isActive(item.slug)
                        ? "text-[#ff4f37]"
                        : "text-[#58595B] hover:text-[#ff4f37]"
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

      {/* Right Preview Section */}
      <div className="transition-all duration-300 ease-in-out">
        {preview ? (
          <>
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full max-w-[400px] transition-opacity duration-300"
            />

            <h5 className="text-[#ff4f37] my-2 text-sm font-bold uppercase transition-all duration-300">
              {preview.title}
            </h5>

            <p className="text-[#58595B] text-base transition-all duration-300">
              {preview.description}
            </p>

            <div className="mt-2 text-xs text-gray-500 italic">
              Hover over links to explore institutions
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Hover on institute to preview</p>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
