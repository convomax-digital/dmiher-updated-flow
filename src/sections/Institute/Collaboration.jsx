import React, { useState } from "react";
import { Link } from "react-router-dom";
import ViewMoreButton from "../../components/UI/Buttons";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";

const Collabaration = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [openIdx, setOpenIdx] = useState(-1);

  const handleToggleModal = () => setShowModal((prev) => !prev);

  if (!data) return null;

  const { stats = [], popup_items = [] } = data;
  // Support both legacy `left_content` and new `paragraphs` key
  const left_content = data.left_content || data.paragraphs || {};

  // Content is a SEPARATE section (array of CTA-like blocks).
  // Hide only when explicitly disabled via `_section_disabled: true`.
  const rawContent = data?.Content;
  const contentDisabled =
    rawContent &&
    !Array.isArray(rawContent) &&
    rawContent._section_disabled === true;
  const contentItems = Array.isArray(rawContent) ? rawContent : [];

  const popupContentItems =
    popup_items?.length > 0
      ? popup_items
      : contentItems.filter((item) => item.tab_type === "popup");

  const popupSections = popupContentItems.flatMap((item) => {
    if (Array.isArray(item.accordion)) {
      return item;
    }

    if (Array.isArray(item.popup)) {
      const hasNestedSections = item.popup.some(
        (section) =>
          Array.isArray(section.accordion) ||
          Array.isArray(section.items) ||
          Array.isArray(section.popup)
      );

      return item.tab_type === "popup" || hasNestedSections
        ? item.popup
        : item;
    }

    return [];
  });

  const hasPopupItems = popupContentItems.length > 0;
  const defaultPopupButtonLabel =
    popupContentItems[0]?.label ||
    popupContentItems[0]?.cta_text ||
    popupContentItems[0]?.title ||
    popupContentItems[0]?.heading ||
    "View Details";

  const getAccordionContent = (item) => {
    if (item.answer) return <RichTextRenderer html={item.answer} />;
    if (item.content) return <RichTextRenderer html={item.content} />;
    if (item.description) return <RichTextRenderer html={item.description} />;
    return null;
  };

  const getAccordionItems = (section) => {
    if (Array.isArray(section.accordion)) return section.accordion;
    if (Array.isArray(section.items)) return section.items;
    if (Array.isArray(section.popup)) return section.popup;
    return [];
  };

  // Dynamic section background from the backend (section_style.bg_color).
  const bgColor = data?.section_style?.bg_color;

  return (
    <div
      className="collab-section"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container collab-layout">
        {/* ================= LEFT CONTENT ================= */}
        <div>
          <hr className="heading-line" />
          <h2 className="heading">{left_content?.heading}</h2>

          {/* HTML DESCRIPTION */}
          {left_content?.desc && (
            <div
              className="collab-text"
            // dangerouslySetInnerHTML={{
            //   __html: left_content.desc,
            // }}
            >
              <RichTextRenderer html={left_content?.desc} />
            </div>
          )}

          {left_content?.cta_text ? (
            <ViewMoreButton
              label={left_content.cta_text}
              onClick={() => {
                const link = left_content?.cta_link;
                if (link) {
                  // External URL → open it; internal path → route to it.
                  if (/^https?:\/\//i.test(link)) {
                    window.open(link, "_blank", "noopener,noreferrer");
                  } else {
                    window.location.href = link.startsWith("/") ? link : `/${link}`;
                  }
                } else {
                  // No link → keep the existing popup behaviour.
                  setShowModal(true);
                }
              }}
            />
          ) : (
            hasPopupItems &&
            !contentItems.some((item) => item.tab_type === "popup") && (
              <ViewMoreButton
                label={defaultPopupButtonLabel}
                onClick={() => setShowModal(true)}
              />
            )
          )}
        </div>

        {/* ================= STATS ================= */}
        {stats.length > 0 && (
          <div className="collab-stats-grid">
            {stats.map((item, index) => {
              const iconSrc = item.img || item.icon;
              const iconHidden = item?._disabled?.img === true;

              return (
                <div key={index} className="collab-stat">
                  {/* icon optional */}
                  {!iconHidden && (
                    <SafeImage
                      src={iconSrc}
                      alt=""
                      className="w-28 h-28 mb-2"
                    />
                  )}

                  {item.description ? (
                    <div
                      className="collab-stat-desc w-full"
                      
                    >
                      <RichTextRenderer
                        html={item.description}
                        
                      />
                    </div>
                  ) : (
                    <>
                      <RichTextRenderer html={item.desc} />
                    </>

                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CONTENT (separate CTA blocks) ================= */}
      {!contentDisabled && contentItems.length > 0 && (
        <div className="container collab-content">
          {contentItems.map((item, idx) => {
            const label =
              item.label || item.cta_text || item.title || item.heading;

            if (item.tab_type === "popup") {
              return (
                <button
                  key={idx}
                  type="button"
                  className="collab-content-btn"
                  onClick={() => setShowModal(true)}
                >
                  {label || "View Details"}
                </button>
              );
            }

            if (item.tab_type === "button" && (item.link || item.page_slug)) {
              const isExternal = item.link?.startsWith("http");
              const href = item.link || `/${item.page_slug}`;

              return isExternal ? (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="collab-content-btn"
                >
                  {label || "Learn More"}
                </a>
              ) : (
                <Link key={idx} to={href} className="collab-content-btn">
                  {label || "Learn More"}
                </Link>
              );
            }

            if (item.description) {
              return (
                <div key={idx} className="collab-content-item">
                  <RichTextRenderer html={item.description} />
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="collab-modal-backdrop" onClick={handleToggleModal}>
          <div
            className="collab-modal custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="collab-modal-header">
              <button onClick={handleToggleModal} className="collab-close">
                &times;
              </button>
            </div>

            {popupSections.map((section, sectionIdx) => {
              const accordionItems = getAccordionItems(section);

              return (
                <div className="p-10" key={sectionIdx}>
                  <div className="h-1 w-16 bg-[#e8502e] mb-3"></div>
                  <h2 className="text-3xl md:text-4xl font-medium text-[#555555] uppercase font-oswald-medium leading-tight">
                    {section.heading ||
                      section.title ||
                      "RESEARCH & COLLABORATIONS"}
                  </h2>

                  {accordionItems.map((item, idx) => {
                    const itemKey = `${sectionIdx}-${idx}`;
                    const isOpen = openIdx === itemKey;

                    return (
                      <div key={itemKey}>
                        <button
                          className={`w-full text-left py-3 border-gray-300 flex justify-between items-center text-base sm:text-lg ${isOpen
                            ? "text-[#555555]"
                            : "text-[#555555] border-b-2 border-[#555555]"
                            }`}
                          onClick={() => setOpenIdx(isOpen ? -1 : itemKey)}
                        >
                          <span className="font-oswald-light text-2xl text-[#555555]">
                            {item.question || item.title || item.heading}
                          </span>
                          <span className="text-xl font-bold">
                            {isOpen ? "-" : "+"}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="pb-3 font-[Arial] text-sm text-[#555555] border-b-2">
                            {getAccordionContent(item)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Collabaration;
