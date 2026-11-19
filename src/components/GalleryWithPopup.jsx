import { useId, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "../styles/components/gallery.css";
import RichTextRenderer from "./RichTextRenderer";
import SafeImage from "./SafeImage";
import { resolveImage } from "../utils/resolveImage";

export function GalleryWithPopup({ data }) {
  if (!data) return null;

  const images = Array.isArray(data.gallery) ? data.gallery : [];
  const [popupIndex, setPopupIndex] = useState(null);

  // Per-instance unique class names for prev/next so multiple gallery
  // sections on the same page don't share their navigation buttons.
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const prevCls = `gallery-prev-${instanceId}`;
  const nextCls = `gallery-next-${instanceId}`;

  const viewType = data.header?.view_type;
  const isSlider = viewType === "slider";

  const getImageSrc = (img) => {
    if (!img) return null;
    if (Array.isArray(img)) return resolveImage(img[0]);
    if (typeof img === "string") return resolveImage(img);
    return null;
  };

  if (!images.length) return null;

  /* In grid mode show up to 9 images per slide (3×3). When there are more,
     paginate via the same arrow controls used elsewhere on the page.
     Pagination uses local state instead of Swiper because the SwiperSlide
     containers don't clamp to viewport width before client hydration —
     during SSR both 9-image grids render side-by-side, producing a 6-col
     row that flashes until Swiper takes over. State-driven pagination
     renders a single slide every time. */
  const PAGE_SIZE = 9;
  const gridPages = isSlider
    ? []
    : Array.from(
        { length: Math.ceil(images.length / PAGE_SIZE) },
        (_, p) => images.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE),
      );
  const [gridPageIndex, setGridPageIndex] = useState(0);

  // Show arrows when slider mode has > 3 images OR grid mode has > 9 images
  const needsArrows = isSlider
    ? images.length > 3
    : gridPages.length > 1;

  const goPrev = () =>
    setGridPageIndex((i) => (i - 1 + gridPages.length) % gridPages.length);
  const goNext = () =>
    setGridPageIndex((i) => (i + 1) % gridPages.length);

  return (
    <section className="container">
      <h2 className="heading">
        <hr className="heading-line" />
        {data.header?.heading || "Gallery"}
      </h2>

      <div className="gallery-nav">
        <RichTextRenderer html={data.header?.intro_text} />

        {/* Arrows only render when pagination is actually needed.
            Slider mode wires them into Swiper via prevCls/nextCls; grid
            mode uses local state. */}
        {needsArrows && (
          <div className="button-wrapper ml-auto">
            <button
              className={`gallery-nav-btn ${isSlider ? prevCls : ""}`}
              aria-label="Previous"
              onClick={isSlider ? undefined : goPrev}
            >
              <ArrowLeft />
            </button>
            <button
              className={`gallery-nav-btn ${isSlider ? nextCls : ""}`}
              aria-label="Next"
              onClick={isSlider ? undefined : goNext}
            >
              <ArrowRight />
            </button>
          </div>
        )}
      </div>

      {/* ============== SLIDER MODE — 3 visible at a time ============== */}
      {isSlider ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          navigation={{ prevEl: `.${prevCls}`, nextEl: `.${nextCls}` }}
          breakpoints={{
            0:    { slidesPerView: 1 },
            640:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {images.map((img, idx) => {
            // The CMS writes this label under either key: older gallery rows use
            // "title", newer ones "caption". Both mean the tile caption, so read
            // both rather than dropping the label on half the galleries.
            const caption = img.caption || img.title;
            const imageSrc = getImageSrc(img.image);
            return (
              <SwiperSlide key={idx}>
                <div
                  className="gallery-card"
                  onClick={() => setPopupIndex(idx)}
                >
                  <SafeImage
                    src={imageSrc}
                    alt={caption || "gallery"}
                    className="gallery-image"
                    loading="lazy"
                  />
                  {caption && (
                    <p className="gallery-image-title">{caption}</p>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        /* ============== GRID MODE — 9 per slide (3×3), paginated ============== */
        <div className="gallery-grid">
          {(gridPages[gridPageIndex] || []).map((img, localIdx) => {
            const absoluteIdx = gridPageIndex * PAGE_SIZE + localIdx;
            // The CMS writes this label under either key: older gallery rows use
            // "title", newer ones "caption". Both mean the tile caption, so read
            // both rather than dropping the label on half the galleries.
            const caption = img.caption || img.title;
            const imageSrc = getImageSrc(img.image);
            return (
              <div
                key={absoluteIdx}
                className="gallery-card"
                onClick={() => setPopupIndex(absoluteIdx)}
              >
                <SafeImage
                  src={imageSrc}
                  alt={caption || "gallery"}
                  className="gallery-image"
                  loading="lazy"
                />
                {caption && (
                  <p className="gallery-image-title">{caption}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Popup */}
      {popupIndex !== null && (
        <ImagePopup
          images={images}
          index={popupIndex}
          onClose={() => setPopupIndex(null)}
        />
      )}
    </section>
  );
}

/* ================= POPUP ================= */
export function ImagePopup({ images, index, onClose }) {
  const getImageSrc = (img) => {
    if (!img) return null;
    if (Array.isArray(img)) return resolveImage(img[0]);
    if (typeof img === "string") return resolveImage(img);
    return null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const imageSrc = getImageSrc(images[index]?.image);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="gallery-popup"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="gallery-popup-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <SafeImage src={imageSrc} alt="popup" />

        <button
          className="gallery-popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
