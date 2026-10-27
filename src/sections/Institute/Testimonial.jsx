import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";

// Tab label can be stored as `tab_name` (canonical) or `name` (some seeds).
const tabLabel = (tab) => tab?.tab_name || tab?.name || "";

// Testimonial body can be stored as a single `paragraph` HTML field, OR as
// structured fields (`desc` + `name` + `info` + `batch`). Build consistent
// HTML for both so the text always renders.
const testimonialHtml = (t) => {
  if (t?.paragraph) return t.paragraph;
  let html = "";
  if (t?.desc) html += t.desc;
  if (t?.name) html += `<p style="font-weight:600;margin-top:0.5rem;">${t.name}</p>`;
  const meta = [t?.info, t?.batch].filter(Boolean).join(" | ");
  if (meta) html += `<p style="color:#555555;">${meta}</p>`;
  return html;
};

const Testimonial = ({ data }) => {
  const { tabs = [], header = {} } = data || {};

  const [activeTab, setActiveTab] = useState(tabLabel(tabs[0]));

  // Find active tab object
  const activeTabData = tabs.find((tab) => tabLabel(tab) === activeTab);

  const testimonials = activeTabData?.testimonials || [];

  return (
    <div className="testimonial-section">
      <div className="container">
        
        {/* HEADER */}
        {header?.title && (
          <h2 className="heading">
            <hr className="heading-line" />
            {header.title}
          </h2>
        )}

        {/* TABS */}
        <div className="testimonial-tabs">
          {tabs.map((tab, index) => {
            const label = tabLabel(tab);
            return (
              <button
                key={label || index}
                className={`testimonial-tab ${
                  activeTab === label ? "testimonial-tab-active" : ""
                } ${index < tabs.length - 1 ? "testimonial-tab-divider" : ""}`}
                onClick={() => setActiveTab(label)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* SWIPER */}
        <div className="testimonial-swiper-wrapper">
          <Swiper
            slidesPerView={"auto"}
            centeredSlides
            spaceBetween={30}
            pagination={{ clickable: true }}
            modules={[Pagination]}
          >
            {testimonials.length > 0 ? (
              testimonials.map((t, idx) => (
                <SwiperSlide key={idx}>
                  <div className="testimonial-slide">
                    
                    {/* IMAGE */}
                  <div className="testimonial-avatar">
                      <SafeImage src={resolveImage(t.image)} alt={t.name || "testimonial"} />
                    </div>

                    {/* CONTENT */}
                    <div className="testimonial-content">
                      <RichTextRenderer html={testimonialHtml(t)} />
                    </div>

                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="testimonial-empty">
                  No testimonials available for this category yet.
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </div>

      </div>
    </div>
  );
};

export default Testimonial;