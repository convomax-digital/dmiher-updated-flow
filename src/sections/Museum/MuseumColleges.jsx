import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import SafeImage from "../../components/SafeImage";
import RichTextRenderer from "../../components/RichTextRenderer";
import { resolveImage } from "../../utils/resolveImage";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

/**
 * Museum — Campus tabs (Jigyasa / Swadhyay). Mirrors the live-site
 * CollegeBox layout 1:1:
 *   • 2-column grid (text left, image carousel right)
 *   • Heading in #91288D (gold) with a horizontal gold rule next to it
 *   • Highlights in a 5-column row with vertical white/20 dividers
 *
 * Data shape (section_key: museum_colleges)
 *   {
 *     tabs: [
 *       {
 *         tab_label, bg_color, heading, description (HTML),
 *         images: [{src, title}, ...],
 *         highlights_heading: "Highlights",
 *         highlights: [{ content: "<p>...</p>" }, ...]
 *       }, ...
 *     ]
 *   }
 */
export default function MuseumColleges({ data }) {
  if (!data) return null;
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;

  const current = tabs[active] || tabs[0];

  return (
    <section className="museum-colleges">
      {/* Tab pills */}
      <ul className="museum-colleges-tabs">
        {tabs.map((t, idx) => (
          <li
            key={idx}
            onClick={() => setActive(idx)}
            className={
              "museum-colleges-tab" +
              (active === idx
                ? " museum-colleges-tab-active"
                : " museum-colleges-tab-inactive")
            }
          >
            {t.tab_label}
          </li>
        ))}
      </ul>

      {/* Active tab body */}
      <div
        className="museum-colleges-body"
        style={current.bg_color ? { backgroundColor: current.bg_color } : undefined}
      >
        <div className="container">
          {/* 2-column: text + image carousel */}
          <div className="museum-colleges-grid">
            {/* Left text */}
            <div className="museum-colleges-text">
              {current.heading && (
                <h2 className="museum-colleges-heading">
                  <span className="museum-colleges-heading-text">{current.heading}</span>
                  <span className="museum-colleges-heading-line" />
                </h2>
              )}
              {current.description && (
                <div className="museum-colleges-desc">
                  <RichTextRenderer html={current.description} />
                </div>
              )}
            </div>

            {/* Right image carousel */}
            {Array.isArray(current.images) && current.images.length > 0 && (
              <ImageCarousel images={current.images} />
            )}
          </div>

          {/* Highlights heading + grid */}
          {Array.isArray(current.highlights) && current.highlights.length > 0 && (
            <>
              <div className="museum-colleges-hl-headwrap">
                <h3 className="museum-colleges-heading">
                  <span className="museum-colleges-heading-text">
                    {current.highlights_heading || "Highlights"}
                  </span>
                  <span className="museum-colleges-heading-line" />
                </h3>
              </div>

              <div className="museum-colleges-hl-grid">
                {current.highlights.map((h, idx) => {
                  const total = current.highlights.length;
                  const isLast = idx === total - 1;
                  // No right border on column-5 (end of a row of 5)
                  const isFifthCol = idx === 4;
                  const showRightBorder = !isLast && !isFifthCol;
                  // Live-site behavior: when there are >5 highlights and the
                  // last row would be exactly 3 items, push the first of those
                  // 3 to column 2 so they end up centered in cols 2-4.
                  const isFirstOfLastThree =
                    total > 5 && idx >= 5 && total - idx === 3;
                  return (
                    <div
                      key={idx}
                      className={
                        "museum-colleges-hl-cell" +
                        (showRightBorder ? " museum-colleges-hl-cell-divider" : "") +
                        (isFirstOfLastThree ? " museum-colleges-hl-cell-start2" : "")
                      }
                    >
                      <RichTextRenderer html={h.content} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ImageCarousel({ images }) {
  return (
    <div className="museum-colleges-imgwrap">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={images.length > 1}
        className="museum-colleges-swiper"
        style={{ height: "100%" }}
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="museum-colleges-slide">
              <SafeImage
                src={resolveImage(img.src || img.image || img)}
                alt={img.title || `Slide ${i + 1}`}
                className="museum-colleges-img"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
