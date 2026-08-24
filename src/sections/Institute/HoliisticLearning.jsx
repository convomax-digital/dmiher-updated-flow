import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SafeImage from "../../components/SafeImage";
import "swiper/css";
import "swiper/css/pagination";

/* =========================
   Arrow Button Component
========================= */

const ArrowButton = ({ direction = "next", onClick }) => {
  return (
    <button
      onClick={onClick}
      className="hlh-arrow-btn"
      aria-label={direction === "next" ? "Next Slide" : "Previous Slide"}
    >
      {direction === "next" ? (
        <ArrowRight className="hlh-arrow-icon" />
      ) : (
        <ArrowLeft className="hlh-arrow-icon" />
      )}
    </button>
  );
};

/* =========================
   Main Component
========================= */

function HolisticInfrastructureSection({ data , college }) {
  const slider = Array.isArray(data?.slider) ? data.slider[0] : data?.slider;
  const source = slider || data || {};

  const layoutType =
    source?.tab_type || source?.layout?.layout_type || data?.layout?.layout_type || "vertical";
  const heading = source?.title || data?.header?.title || "";
  const subtitle = source?.subtitle || data?.header?.subtitle || "";
  const pageSlug = college;

  const cta = source?.cat || source?.cta || data?.cta || [];
  const ctaItem = Array.isArray(cta) ? cta[0] : cta?.["0"];

  const ctaLink =
    ctaItem?.has_micro_page && ctaItem?.micro_slug
      ? `/${pageSlug}/${ctaItem.micro_slug}`
      : "";

  const dimensions = (source?.dimensions || data?.dimensions || []).map(
    (item, index) => ({
      id: index + 1,
      title: item.title,
      // honor API's _disabled.desc flag; accept either `description` (HTML) or `desc` (plain text)
      description:
        item?._disabled?.desc === true
          ? ""
          : item.description || item.desc || "",
      image: item.img,
    }),
  );

  // When every dimension is title-only (no description), we center the
  // left column so the list isn't awkwardly top-aligned against the image.
  const titlesOnly = dimensions.every((d) => !d.description);

  const swiperRef = useRef(null);

  /* ===============================
     HORIZONTAL LAYOUT
  =============================== */

  if (layoutType === "horizontal") {
    return (
      <div className="hlh-section">
        <div className="hlh-container">
          {/* Header */}
          <div className="hlh-header">
            <h1 className="hlh-title">
              <hr className="hlh-line" />
              {heading}
            </h1>
          </div>

          <div className="hlh-subheader">
            <h2 className="hlh-subtitle">{subtitle}</h2>

            {/* Navigation Arrows */}
            <div className="inst-hl-arrows">
              <ArrowButton
                direction="prev"
                onClick={() => swiperRef?.current?.slidePrev()}
              />
              <ArrowButton
                direction="next"
                onClick={() => swiperRef?.current?.slideNext()}
              />
            </div>
          </div>

          {/* Swiper */}
          <div className="hlh-swiper">
            <Swiper
              modules={[Navigation, Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              loop={true}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
            >
              {dimensions.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="hlh-slide">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="hlh-image"
                    />

                    <div className="hlh-content">
                      <div className="hlh-number">
                        <span className="hlh-number-overlay"></span>
                        <span className="hlh-number-text">{item.id}</span>
                      </div>

                      <div className="hlh-text">
                        <h3 className="hlh-item-title">{item.title}</h3>
                        {item.description && (
                          <div
                            className="hlh-item-desc"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* CTA buttons (Electives / Transcript etc.). The vertical layout
              renders these, but the horizontal branch was missing the block —
              so horizontal-layout institutes (e.g. SAS) showed no nav button
              even though the card data exists. */}
          {cta?.length > 0 && (
            <div className="holistic-cta">
              <div className="holistic-cta-wrapper">
                {cta.map((item, index) =>
                  item?.label ? (
                    <Link
                      key={index}
                      className="holistic-cta-button"
                      to={`/${college}/${item.cta_key}`}
                    >
                      {item.label}
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ===============================
     VERTICAL DEFAULT LAYOUT
  =============================== */

  const items =
    dimensions.map((item) => ({
      id: item.id,
      label: item.title,
      description: item.description,
      image_key: item.image,
    })) || [];

  const [activeId, setActiveId] = useState(items[0]?.id ?? null);

  const activeItem =
    items.find((section) => section.id === activeId) || items[0] || {};

  // Dynamic section background from the backend (section_style.bg_color).
  const bgColor = data?.section_style?.bg_color;

  return (
    <div
      className="holistic-section"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container">
      <div
        className={`holistic-layout ${
          titlesOnly ? "holistic-layout--titles-only" : ""
        }`}
      >

        {/* TEXT */}
        <div
          className={`holistic-text ${
            titlesOnly ? "holistic-text--centered" : ""
          }`}
        >
          <h2 className="heading">
            <hr className="heading-line" />
            {heading}
          </h2>

          <div className="holistic-list custom-scrollbar">
            {items.map((section) => (
              <div key={section.id} className="holistic-item">
                <span
                  onClick={() => setActiveId(section.id)}
                  className={`holistic-item-label ${
                    activeId === section.id
                      ? "holistic-item-label-active"
                      : "holistic-item-label-inactive"
                  }`}
                >
                  {section.label}
                </span>

                {section.description && (
                  <div
                    className="holistic-item-content"
                    dangerouslySetInnerHTML={{
                      __html: section.description,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* IMAGE */}
        <div className="holistic-image-wrapper">
          <div className="holistic-image-box">
            <SafeImage
              src={activeItem.image_key}
              alt={activeItem.label}
            />
          </div>
        </div>

     

      </div>
        <div className="holistic-cta" style={cta?.length ? undefined : { display: "none" }}>

    
   {cta?.length > 0 && <div className="holistic-cta-wrapper">
      {Array.isArray(cta) &&
        cta.map((item, index) => (
          item?.label && (
            <Link
              key={index}
              // to={item.cta_key}
              className="holistic-cta-button"
              to={`/${college}/${item.cta_key}`}
            >
              {item.label}
            </Link>
          )
        ))}
   

  </div>
}
</div>
      </div>
    </div>
  );
}

export default HolisticInfrastructureSection;