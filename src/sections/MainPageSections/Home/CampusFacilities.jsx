import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import SafeImage from "../../../components/SafeImage";

export const SectionHeader = ({
  title,
  subtitle,
  onPrev,
  onNext,
  showViewAll = true,
  viewAllLink = "#",
}) => (
  <div className="cf-section-header">
    {title && (
      <>
        <div className="cf-section-line" />
        <h2 className="cf-section-title">{title}</h2>
      </>
    )}

    <div className="cf-header-row">
      <p className="cf-subtitle">{subtitle}</p>

      <div className="cf-divider" />

      <div className="cf-actions">
        <button onClick={onPrev} className="cf-nav-btn">
          <ArrowLeft size={20} />
        </button>

        <button onClick={onNext} className="cf-nav-btn">
          <ArrowRight size={20} />
        </button>

        {showViewAll && (
          <Link to={viewAllLink} className="cf-view-all">
            VIEW ALL
          </Link>
        )}
      </div>
    </div>

    {showViewAll && (
      <div className="cf-view-all-mobile">
        <a href={viewAllLink} target="_blank" rel="noopener noreferrer">
          VIEW ALL
        </a>
      </div>
    )}
  </div>
);

function CampusFacilities({ data }) {
  const swiperRef = useRef(null);
  const [popupImages, setPopupImages] = useState([]);
  const [popupIndex, setPopupIndex] = useState(null);

  const openPopup = (items, index) => {
    setPopupImages(items.map((i) => i.image));
    setPopupIndex(index);
  };

  // While the lightbox is open, pin the page: lock body scroll so the
  // background can't move behind the fixed overlay (that scroll-drift was
  // what made the popup "not look great in scroll"), and close on Escape.
  useEffect(() => {
    if (popupIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setPopupIndex(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [popupIndex]);

  return (
    <section className="cf-main-section">
      <div className="cf-container">
        <h2 className="heading">
          <hr className="heading-line" />
          {data.basic?.title}
        </h2>

        {data.tabs?.map((tab, idx) => (
          <div key={idx} className="cf-tab-block">
            <SectionHeader
              subtitle={tab.tab_label}
              onPrev={() => swiperRef.current?.swiper.slidePrev()}
              onNext={() => swiperRef.current?.swiper.slideNext()}
              viewAllLink={tab.url}
            />

            {tab.description && (
              <p className="cf-tab-description text-[#555555] text-sm sm:text-base max-w-3xl mb-5 leading-relaxed">
                {tab.description}
              </p>
            )}

            <Swiper
              ref={swiperRef}
              modules={[Navigation]}
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                480: { slidesPerView: 1 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {tab.images?.map((item, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="cf-card"
                    onClick={() => openPopup(tab.images, index)}
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.text}
                      className="cf-card-img"
                    />
                    <p className="cf-card-text">{item.text}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}

        {/* Popup — rendered into <body> via a portal so the fixed overlay is
            anchored to the viewport (never to a transformed ancestor) and
            always sits above floating widgets like the WhatsApp button. */}
        {popupIndex !== null &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="cf-popup-overlay"
              onClick={() => setPopupIndex(null)}
            >
              <div
                className="cf-popup-content"
                onClick={(e) => e.stopPropagation()}
              >
                <SafeImage
                  src={popupImages[popupIndex]}
                  className="cf-popup-img"
                  alt="preview"
                />
                <button
                  className="cf-popup-close"
                  onClick={() => setPopupIndex(null)}
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>
    </section>
  );
}

export default CampusFacilities;