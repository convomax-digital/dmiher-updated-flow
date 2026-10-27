import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import RichTextRenderer from "../../components/RichTextRenderer";
import ViewMoreButton from "../../components/UI/ViewMore";

function InfoSection({ data }) {
  const source = data?.Info || data?.slider;
  const [showMore, setShowMore] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  if (!data || !Array.isArray(source) || source.length === 0) {
    return null;
  }

  const item = source[0] || {};

  const {
    title,
    subtitle,
    tegline,
    desc,
    institute_desc,
    non_desc,
    viredesc,
    content,
  } = item;

  const mainDesc = institute_desc || non_desc || desc;

  // Inline view-more blocks: tab_type === "view" with a description.
  const expandedBlocks = Array.isArray(content)
    ? content.filter(
        (c) =>
          c?._section_enabled !== false &&
          c?.tab_type !== "popup" &&
          c?.description
      )
    : [];

  // Popup blocks: tab_type === "popup" with popup_content[] of {title, description}.
  // Flatten across all popup-typed content entries so the modal renders every
  // section, then drop individual sections the admin has toggled off via the
  // per-section enable/disable switch (_section_enabled === false).
  // Sections with `images[]` are auto-converted to a slider in the popup
  // renderer below — no separate flag is required.
  const popupSections = Array.isArray(content)
    ? content
        .filter(
          (c) =>
            c?._section_enabled !== false &&
            c?.tab_type === "popup" &&
            Array.isArray(c.popup_content)
        )
        .flatMap((c) => c.popup_content)
        .filter(
          (s) =>
            s?._section_enabled !== false && (s?.title || s?.description)
        )
    : [];

  const hasExpanded = Boolean(viredesc) || expandedBlocks.length > 0;
  const hasPopup = popupSections.length > 0;

  return (
    <div className="info-wrapper">

      {/* TITLE */}
      {title && (
        <h2 className="info-title">
          <hr className="info-title-line" />

          <span className="info-title-text">
            {title}

            {subtitle && (
              <p className="info-subtitle">{subtitle}</p>
            )}
          </span>

          <hr className="info-title-line" />
        </h2>
      )}

      {/* CONTENT */}
      <section className="info-section">

        {/* Tagline */}
        {tegline && (
          <h1 className="info-tagline">{tegline}</h1>
        )}

        {/* Main Description */}
        {mainDesc && (
          <div className="info-description">
            <RichTextRenderer html={mainDesc} />
          </div>
        )}

        {/* ===== EXPANDED BLOCKS ===== */}
        {showMore && viredesc && (
          <div className="info-description">
            <RichTextRenderer html={viredesc} />
          </div>
        )}

        {showMore &&
          expandedBlocks.map((block, idx) => (
            <div key={idx} className="info-description">
              <RichTextRenderer html={block.description} />
            </div>
          ))}

        {/* ===== VIEW MORE / VIEW LESS (inline) ===== */}
        {hasExpanded && !showMore && (
          <ViewMoreButton
            label="View More"
            onClick={() => setShowMore(true)}
          />
        )}

        {hasExpanded && showMore && (
          <ViewMoreButton
            label="View Less"
            onClick={() => setShowMore(false)}
          />
        )}

        {/* ===== KNOW MORE (popup modal) ===== */}
        {hasPopup && (
          <ViewMoreButton
            label="Know More"
            onClick={() => setShowPopup(true)}
          />
        )}

      </section>

      {/* ===== POPUP MODAL ===== */}
      {hasPopup && showPopup && (
        <InfoPopup
          title={title}
          subtitle={subtitle}
          sections={popupSections}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

/* ================= POPUP =================
 * Full-screen overlay with backdrop blur. Clicking outside the dialog or
 * the close button dismisses it. Mirrors the live-site JNMC "Know More"
 * design: dark header with X, repeated title/subtitle, then each section
 * as a heading-line + heading + rich-text description block, with the
 * 2nd, 5th, etc. section tinted (alternating background bands).
 */
function InfoPopup({ title, subtitle, sections, onClose }) {
  // Lock body scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 top-[80px] sm:top-[101px] bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[80vh] overflow-y-auto rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar with close button */}
        <div className="bg-[#132F5C] h-10 flex items-center justify-end px-4 sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-200 text-3xl leading-none font-light hover:text-red-400 transition duration-200"
          >
            &times;
          </button>
        </div>

        {/* Title + Subtitle re-display */}
        {(title || subtitle) && (
          <h2 className="flex flex-wrap mt-5 items-center justify-center sm:justify-between text-[#91288D] font-oswald-medium text-3xl tracking-wider uppercase mb-6 text-center px-4">
            <hr className="hidden sm:block flex-grow border-t border-[#91288D]" />
            <span className="px-4 whitespace-normal text-sm sm:text-lg md:text-xl lg:text-2xl">
              {title}
              {subtitle && (
                <p className="text-base text-gray-500 normal-case">
                  {subtitle}
                </p>
              )}
            </span>
            <hr className="hidden sm:block flex-grow border-t border-[#91288D]" />
          </h2>
        )}

        {/* Sections — fully data-driven from backend popup_content[].
            Each section: { title, description, images? }.
            - title: optional plain text — rendered with orange line above
            - description: optional rich HTML — rendered via RichTextRenderer
            - images: optional array of URLs — when present, renders a Swiper
              slider (auto-play + navigation) alongside the description
            Background colors (live-site parity, sections/JNMC/JNMCinfoSection.jsx):
            - Section with images (e.g. AVBRH) → bg-gray-100
            - Section at index 1 (after the intro) → light blue band
            - All others → white (no band) */}
        <div className="text-sm text-[#444] font-[Arial] leading-relaxed space-y-3">
          {sections.map((section, idx) => {
            const imgs = Array.isArray(section.images)
              ? section.images
                  .map((it) =>
                    typeof it === "string"
                      ? it
                      : it?.src || it?.url || it?.image || it?.img
                  )
                  .filter(Boolean)
              : [];
            const hasSlider = imgs.length > 0;
            const bandClass = hasSlider
              ? "bg-gray-100 pt-5 pb-5"
              : idx === 1
                ? "bg-[#269BFF]/10 pt-5 pb-5"
                : "";
            return (
              <div
                key={idx}
                className={bandClass}
              >
                <div className="pt-4 px-6 md:px-10">
                  {section.title && (
                    <SectionHeading>{section.title}</SectionHeading>
                  )}
                  {hasSlider ? (
                    <div className="flex flex-col lg:flex-row justify-center">
                      {section.description && (
                        <div className="basis-full lg:basis-[60%] mb-4 lg:mb-0 lg:mr-4">
                          <RichTextRenderer html={section.description} />
                        </div>
                      )}
                      <div className="basis-full rounded-lg overflow-hidden w-full h-[300px] md:h-[400px] relative custom-swiper-nav">
                        <Swiper
                          spaceBetween={30}
                          slidesPerView={1}
                          loop={imgs.length > 1}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          navigation={imgs.length > 1}
                          className="rounded-lg overflow-hidden h-full"
                          modules={[Autoplay, Navigation]}
                        >
                          {imgs.map((src, i) => (
                            <SwiperSlide key={i}>
                              <img
                                src={src}
                                alt={`${section.title || "Slide"} ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  ) : (
                    section.description && (
                      <RichTextRenderer html={section.description} />
                    )
                  )}
                </div>
              </div>
            );
          })}
          {/* Bottom padding so the last section isn't flush against the edge */}
          <div className="pb-10" />
        </div>

        {/* Swiper navigation styling — applies to any sliders inside the popup */}
        <style>{`
          .custom-swiper-nav .swiper-button-next,
          .custom-swiper-nav .swiper-button-prev {
            width: 30px;
            height: 30px;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 9999px;
            margin-top: 3px;
            top: 50%;
            transform: translateY(-50%);
          }
          .custom-swiper-nav .swiper-button-next::after,
          .custom-swiper-nav .swiper-button-prev::after {
            font-size: 16px;
            color: white;
          }
          .custom-swiper-nav .swiper-button-next { right: 10px; }
          .custom-swiper-nav .swiper-button-prev { left: 10px; }
        `}</style>
      </div>
    </div>
  );

  // Portal to <body> so `fixed inset-0` is anchored to the viewport (not a
  // transformed section ancestor, which was trapping the modal inside the
  // section) — giving a true full-screen dark-blur overlay like the live site.
  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

// Reusable section heading: orange line + uppercase grey title (live-site style)
function SectionHeading({ children }) {
  return (
    <h2 className="text-3xl uppercase md:text-4xl text-left font-[500] text-[#555555] mb-5 tracking-wider font-oswald-medium">
      <hr className="w-16 sm:w-20 border-[#91288D] mb-2 border-t-4" />
      {children}
    </h2>
  );
}

export default InfoSection;
