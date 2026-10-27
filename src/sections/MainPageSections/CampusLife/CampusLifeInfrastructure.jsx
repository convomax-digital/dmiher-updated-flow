import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SafeImage from "../../../components/SafeImage";

/**
 * CampusLifeInfrastructure
 * ------------------------
 * Data shape:
 *   items: [{
 *     title, description, bg_color,
 *     image_groups: [{ title, gallery: [{ image, caption }] }]
 *   }]
 *
 * Each top-level item renders a full-width coloured section: heading +
 * description, then a grid of "image group" cards. Each card has a title and
 * an auto-playing image carousel with a bottom-left caption overlay.
 */
const CampusLifeInfrastructure = ({ data }) => {
  if (!data) return null;

  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) return null;

  return (
    <>
      {items.map((item, idx) => {
        const groups = Array.isArray(item.image_groups) ? item.image_groups : [];
        const bg = item.bg_color || "#e3f2fd";

        return (
          <section
            key={idx}
            className="clinf-section"
            style={{ backgroundColor: bg }}
          >
            <div className="container">
              {/* Heading + description */}
              <div className="mb-8">
                {item.title && (
                  <h2 className="heading">
                    <hr className="heading-line" />
                    {item.title}
                  </h2>
                )}
                {item.description && (
                  <p className="mt-3 text-[#555555] font-[Arial] max-w-4xl">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Image-group cards */}
              <div className="clinf-grid">
                {groups.map((group, gIdx) => {
                  const gallery = Array.isArray(group.gallery) ? group.gallery : [];
                  if (!gallery.length) return null;

                  return (
                    <div key={gIdx} className="clinf-card">
                      <h3 className="clinf-title">{group.title}</h3>
                      <div className="clinf-swiper-wrap">
                        <Swiper
                          modules={[Pagination, Autoplay]}
                          slidesPerView={1}
                          loop={gallery.length > 1}
                          autoplay={{ delay: 4000, disableOnInteraction: false }}
                          pagination={{ clickable: true }}
                          className="clinf-swiper"
                        >
                          {gallery.map((img, i) => (
                            <SwiperSlide key={i}>
                              <div className="clinf-slide">
                                <SafeImage
                                  src={img.image}
                                  alt={img.caption || group.title || ""}
                                  className="clinf-img"
                                />
                                {img.caption && (
                                  <div className="clinf-caption">{img.caption}</div>
                                )}
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default CampusLifeInfrastructure;
