import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import resolveImage from "../../utils/resolveImage";

/**
 * SAHS Placements
 * ----------------------------------------------------------------------
 * Dedicated section for SAHS Wardha. Mirrors the live-site
 * `sections/SAHS/PlacementsSAHS.jsx` 1:1:
 *   - "PLACEMENTS – National and International" heading with red bar
 *   - description paragraph
 *   - median package highlight ("₹35,00,000")
 *   - International Placements carousel (3/view, taller frames, no shadow)
 *   - National Placements carousel (5/view, white rounded shadow boxes)
 *
 * Data shape:
 * {
 *   header: { heading, description, median_package },
 *   international_placements: [{ image, alt }],
 *   national_placements:      [{ image, alt }],
 * }
 *
 * Also tolerates a flat shape with the same field names at root.
 */
export default function SAHSPlacements({ data }) {
  if (!data) return null;

  const header = data.header || data;
  const heading =
    header.heading || "PLACEMENTS – National and International";
  const description = header.description || "";
  const medianPackage = header.median_package || "";

  const international = Array.isArray(data.international_placements)
    ? data.international_placements
    : [];
  const national = Array.isArray(data.national_placements)
    ? data.national_placements
    : [];

  return (
    <section className="sahs-plc-section bg-[#FAF8F0] py-20">
      <div className="container">
        <h2 className="sahs-plc-heading text-3xl md:text-4xl font-oswald-medium font-[500] text-[#555555] mb-6">
          <hr className="w-16 border-[#91288D] border-t-4 mb-3" />
          {heading}
        </h2>
        {description && (
          <p
            className="sahs-plc-description text-gray-600 mb-4 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {medianPackage && (
          <p className="sahs-plc-median text-md text-gray-500 mb-10">
            The median package for international placements currently stands at{" "}
            <span className="font-bold text-[#91288D]">{medianPackage}</span>,
            reflecting the global value of a DMIHER Allied Health Sciences
            education.
          </p>
        )}

        {/* International Placements */}
        {international.length > 0 && (
          <div className="mb-12">
            <h3 className="sahs-plc-intl-title text-xl sm:text-2xl font-bold text-[#269BFF] mb-6">
              International Placements
            </h3>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={3}
              spaceBetween={30}
              loop={international.length > 3}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              breakpoints={{
                0: { slidesPerView: 1 },
                320: { slidesPerView: 1 },
                480: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {international.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <div className="sahs-plc-intl-frame w-full h-48 sm:h-56 md:h-60 flex items-center justify-center rounded-lg">
                    <img
                      src={resolveImage(item.image)}
                      alt={item.alt || `NHS Placement ${idx + 1}`}
                      className="max-h-40 sm:max-h-48 md:max-h-56 max-w-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* National Placements */}
        {national.length > 0 && (
          <div>
            <h3 className="sahs-plc-nat-title text-xl sm:text-2xl font-bold text-[#132F5C] mb-6">
              National Placements
            </h3>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={5}
              spaceBetween={30}
              loop={national.length > 5}
              autoplay={{ delay: 1800, disableOnInteraction: false }}
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {national.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <div className="sahs-plc-nat-frame w-full h-28 sm:h-36 md:h-40 flex items-center justify-center bg-white rounded-lg shadow cursor-grab">
                    <img
                      src={resolveImage(item.image)}
                      alt={item.alt || `Placement Logo ${idx + 1}`}
                      className="max-h-20 sm:max-h-28 md:max-h-32 max-w-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
