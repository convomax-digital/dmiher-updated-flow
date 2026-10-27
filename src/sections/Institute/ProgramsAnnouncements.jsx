// import { useState } from "react";
// import { FileText } from "lucide-react";
// import { PopupModal } from "../../components/UI/CardMandatoryDisclosure";
// // import "../styles/InstituteSections/Announcements.css";

// const ProgramsAnnouncements = ({ data }) => {
//   const { heading, buttons = [], pg_docs = [], ug_docs = [] } = data || {};
//   const [showPG, setShowPG] = useState(false);
//   const [showUG, setShowUG] = useState(false);

//   const openPopup = (type) =>
//     type === "pg" ? setShowPG(true) : setShowUG(true);

//   return (
//     <>
//       <section className="announce-section container">
//      <h2 className="heading">
//               <hr className="heading-line" />
//           {heading}
//         </h2>

//         <div className="announce-grid">
//           {buttons.map((btn, i) => (
//             <button
//               key={i}
//               onClick={() => openPopup(btn.type)}
//               className="announce-btn"
//             >
//               <FileText className="text-[#91288D] w-6 h-6 min-w-6" />
//               <div className="announce-btn-text">{btn.label}</div>
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* PG POPUP */}
//       <PopupModal show={showPG} onClose={() => setShowPG(false)} title="">
//         <PopupGrid docs={pg_docs} />
//       </PopupModal>

//       {/* UG POPUP */}
//       <PopupModal show={showUG} onClose={() => setShowUG(false)} title="">
//         <PopupGrid docs={ug_docs} />
//       </PopupModal>
//     </>
//   );
// };

// export default ProgramsAnnouncements;

// /* ================= REUSABLE GRID ================= */
// function PopupGrid({ docs }) {
//   if (!docs.length) return <p>No documents available.</p>;

//   return (
//     <div
//       className={`announce-popup-grid ${
//         docs.length > 1 ? "announce-popup-grid-2" : ""
//       }`}
//     >
//       {docs.map((item, index) => {
//         const single =
//           docs.length > 1 &&
//           docs.length % 2 === 1 &&
//           index === docs.length - 1;

//         return (
//           <a
//             key={index}
//             href={item.link}
//             target="_blank"
//             rel="noopener noreferrer"
//             className={`announce-doc ${
//               single ? "announce-doc-single" : ""
//             }`}
//           >
//             <FileText className="w-5 h-5" />
//             <span>{item.name}</span>
//           </a>
//         );
//       })}
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";

// Columns-per-row coming from the backend (layout.columns), mirrors the
// button section. Cards stretch to fill their column for a uniform grid.
const COL_MAP = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const ProgramsAnnouncements = ({ data }) => {
  if (!data) return null;

  const heading = data?.header?.heading;
  const cards = Array.isArray(data?.cards) ? data.cards : [];

  const columns = Number(data?.layout?.columns) || 3;
  const colClass = COL_MAP[columns] || "md:grid-cols-3";

  // Dynamic section background from the backend (section_style.bg_color).
  const bgColor = data?.section_style?.bg_color;

  const [popupDocs, setPopupDocs] = useState([]);
  const [popupTitle, setPopupTitle] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Accept schema (snake_case) and legacy (Title Case) action keys.
  const isDirect = (card) =>
    card.tab_type === "direct_pdf" || card.action_type === "Direct PDF";
  const isPopup = (card) =>
    card.tab_type === "popup_pdf" || card.action_type === "Popup PDFs";

  // Schema stores `pdf` as a repeatable group [{label, pdf}, ...]; legacy data
  // stores `pdf` as a single URL string. Normalize to [{name, link}, ...].
  const toDocs = (card) => {
    if (Array.isArray(card.pdf)) {
      return card.pdf
        .map((item) => ({
          name: item?.label || item?.name || card.title,
          link: item?.pdf || item?.link || item?.url,
        }))
        .filter((d) => d.link);
    }
    const link = card.direct_pdf || card.pdf;
    return link ? [{ name: card.title, link }] : [];
  };

  const handleClick = (card) => {
    if (isDirect(card)) {
      const link = card.direct_pdf || card.pdf;
      if (link) window.open(link, "_blank");
      return;
    }

    if (isPopup(card)) {
      setPopupDocs(toDocs(card));
      setPopupTitle(card.title || "");
      setShowPopup(true);
    }
  };

  return (
    <>
      <div
        className="announce-section-wrapper"
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <section className="announce-section container">
          {heading && (
            <h2 className="heading">
              <hr className="heading-line" />
              {heading}
            </h2>
          )}

          <div className={`grid grid-cols-1 ${colClass} gap-6 w-full`}>
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleClick(card)}
                className="announce-btn"
              >
                <FileText className="text-[#91288D] w-6 h-6 min-w-6" />
                <div className="announce-btn-text">{card.title}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* POPUP */}
      {showPopup && (
        <Popup
          name={popupTitle}
          docs={popupDocs}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default ProgramsAnnouncements;

/* ================= POPUP =================
 * 2 docs per row on desktop (md+), single column on mobile.
 * Single doc → centered with a narrower max width.
 * Odd count with multiple docs → last item spans both columns and centers.
 * Click outside the dialog closes it.
 */
const Popup = ({ name, docs = [], onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const multi = docs.length > 1;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div
        ref={popupRef}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        {name && (
          <h3 className="text-2xl font-bold mb-6 text-center">{name}</h3>
        )}
        <div
          className={`grid gap-3 ${
            multi ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {docs.length > 0 ? (
            docs.map((doc, index) => {
              const isSingleInLastRow =
                multi && docs.length % 2 === 1 && index === docs.length - 1;
              return (
                <a
                  key={index}
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full h-[60px] text-base font-medium text-white bg-[#132F5C] rounded hover:bg-[#91288D] transition ${
                    !multi ? "max-w-xs mx-auto" : ""
                  } ${
                    isSingleInLastRow ? "md:col-span-2 md:max-w-xs md:mx-auto" : ""
                  }`}
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </a>
              );
            })
          ) : (
            <p className="text-gray-600">No documents available.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
