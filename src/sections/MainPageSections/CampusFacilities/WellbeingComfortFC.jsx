import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import RichTextRenderer from "../../../components/RichTextRenderer";
import SafeImage from "../../../components/SafeImage";

const WellbeingComfortFC = ({ data }) => {
  if (!data) return null;

  const basic = data.basic || {};
  const sections = data.sections || [];

  return (
    <section
      className="wfc-section"
      style={{
        backgroundColor: basic.bg_color || "#eaf4ff",
        color: basic.text_color || "#555555",
      }}
    >
      <div className="container">

        {/* Heading */}
        <div className="wfc-heading-wrap">
          {basic.title && (
            <h2 className="heading">
              <hr className="heading-line" />
              {basic.title}
            </h2>
          )}

          <p className="wfc-desc">
            <RichTextRenderer html={basic.desc} />
          </p>
        </div>

        {/* Grid */}
        <div className="wfc-grid">
          {sections.map((section, idx) => (
            <div key={idx} className="wfc-card">

              {/* Section Title */}
              <h3
                className="wfc-card-title"
                style={{
                  color: basic.card_title_color || "#2E57AA",
                }}
              >
                {section.title}
              </h3>

              {/* Swiper */}
              <div className="wfc-card-swiper-wrap">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  slidesPerView={1}
                  loop
                  autoplay={{ delay: 4000 }}
                  pagination={{
                    clickable: true,
                  }}
                  className="wfc-card-swiper"
                >
                  {section.images?.map((img, i) => (
                    <SwiperSlide key={i}>
                      <div className="wfc-slide">

                        <SafeImage
                          src={img.image}
                          alt={img.caption}
                          className="wfc-slide-img"
                        />

                        {/* Caption */}
                        {img.caption && (
                          <div className="wfc-slide-caption">
                            {img.caption}
                          </div>
                        )}

                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WellbeingComfortFC;
