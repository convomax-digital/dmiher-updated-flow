import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import CampusFacilities from "./Home/CampusFacilities";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";

function Gallery({ data }) {
  const section = Array.isArray(data) ? data[0] : data;

  const layoutType = section?.layout?.layout_type;
  const basic = section?.basic || {};
  const tabs = section?.tabs || [];

  if (layoutType === "campus") {
    return <CampusFacilities data={section} />;
  }

  const { tabs_order, tabs_labels, tabs_descriptions, images } = useMemo(() => {
    const order = [];
    const labels = {};
    const descriptions = {};
    const imgs = {};

    tabs.forEach((tab) => {
      if (!tab?.tab_key) return;

      order.push(tab.tab_key);
      labels[tab.tab_key] = tab.tab_label;
      descriptions[tab.tab_key] = tab.description;

      imgs[tab.tab_key] =
        tab.images?.map((i) => i.image) || [];
    });

    return {
      tabs_order: order,
      tabs_labels: labels,
      tabs_descriptions: descriptions,
      images: imgs,
    };
  }, [tabs]);

  const [activeSection, setActiveSection] = useState(null);
  const [popupIndex, setPopupIndex] = useState(null);

  useEffect(() => {
    if (tabs_order.length > 0) {
      setActiveSection(tabs_order[0]);
    }
  }, [tabs_order]);

  const visibleImages =
    activeSection ? images[activeSection] || [] : [];

  const nextImage = () =>
    setPopupIndex((prev) =>
      (prev + 1) % visibleImages.length
    );

  const prevImage = () =>
    setPopupIndex((prev) =>
      (prev - 1 + visibleImages.length) %
      visibleImages.length
    );

  useEffect(() => {
    if (popupIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPopupIndex(null);
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [popupIndex, visibleImages.length]);

  const addressArr = section?.address || [];

  return (
    <div className="gallery-section">
      <div className="gallery-container">

        {basic.title && (
          <h2 className="heading">
            <hr className="heading-line" />
            {basic.title}
          </h2>
        )}

        {/* Tabs */}
        <div className="gallery-tabs">
          {tabs_order.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`gallery-tab ${
                activeSection === key
                  ? "gallery-tab-active"
                  : "gallery-tab-inactive"
              }`}
            >
              {tabs_labels[key]}
            </button>
          ))}
        </div>

        {/* Active tab description */}
        {activeSection && tabs_descriptions[activeSection] && (
          <p className="gallery-description text-[#555555] text-sm sm:text-base max-w-3xl mb-6 leading-relaxed">
            {tabs_descriptions[activeSection]}
          </p>
        )}

        {/* Image Grid */}
        {visibleImages.length > 0 ? (
          <div className="gallery-grid">
            {visibleImages.map((img, index) => (
              <SafeImage
                key={index}
                src={img}
                alt="gallery"
                className="gallery-image"
                onClick={() => setPopupIndex(index)}
              />
            ))}
          </div>
        ) : (
          <p className="gallery-empty">
            No images available
          </p>
        )}

        {/* Popup */}
        {popupIndex !== null &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="gallery-popup-overlay"
              role="dialog"
              aria-modal="true"
              onClick={() => setPopupIndex(null)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="gallery-popup-prev"
                aria-label="Previous"
              >
                <ArrowLeft size={24} />
              </button>

              <div
                className="gallery-popup-content"
                onClick={(e) => e.stopPropagation()}
              >
                <SafeImage
                  src={visibleImages[popupIndex]}
                  className="gallery-popup-img"
                  alt="preview"
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="gallery-popup-next"
                aria-label="Next"
              >
                <ArrowRight size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupIndex(null);
                }}
                className="gallery-popup-close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>,
            document.body,
          )}
      </div>

      {/* ============================= IMPORTANT DETAILS ============================= */}

      {addressArr.length > 0 && (
        <section className="gallery-details">
          <div className="gallery-container">

            <h2 className="heading">
              <hr className="heading-line" />
              Important Details
            </h2>

            <div className="gallery-details-grid">

              {addressArr.map((item, index) => (
                <div
                  key={index}
                  className={`gallery-details-item ${index === 0 ? "gallery-details-item-first" : ""}`}
                >
                  <h3 className="">
                    {item.heading}
                  </h3>

                  <RichTextRenderer html={item.desc} />
                </div>
              ))}

            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Gallery;
