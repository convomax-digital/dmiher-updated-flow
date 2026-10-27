import React from "react";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/**
 * Generic institute Placements section.
 *
 * Renders:
 *   - heading + description
 *   - highlights list (supports both flat `highlights[]` and the older
 *     `optinal_content[]._section_enabled + .highlights[]` shape)
 *   - OPTIONAL: "Our Prominent Recruiters" label + logo carousel
 *     when `data.logos[]` (or an `optinal_content` block with tab_type='logos')
 *     is present. Used by DMCP.
 */
export default function Placements({ data }) {
  const { header = {} } = data || {};

  // `optinal_content` may arrive as an array (enabled blocks) OR as an object
  // like `{ _section_disabled: true }` when the admin disables it. Only treat
  // it as a list when it's actually an array, otherwise `.filter()` would throw.
  const optionalContent = Array.isArray(data?.optinal_content)
    ? data.optinal_content
    : [];

  // Highlights (legacy + new shape)
  const highlights = Array.isArray(data?.highlights)
    ? data.highlights
    : optionalContent
        .filter((block) => block?._section_enabled !== false)
        .flatMap((block) => block?.highlights || []);

  // Logos — accept either top-level `logos[]` or optinal_content blocks with tab_type='logos'
  const logos = Array.isArray(data?.logos)
    ? data.logos
    : optionalContent
        .filter((block) => block?._section_enabled !== false && block?.tab_type === "logos")
        .flatMap((block) => block?.logos || []);

  const recruitersLabel = data?.recruiters_label || "";

  // Dynamic section background (e.g. SAHS #FAF1F9).
  const bgColor = data?.section_style?.bg_color;

  // International / National placements block (tab_type = international_national).
  const intlNational =
    optionalContent
      .filter(
        (b) =>
          b?._section_enabled !== false &&
          b?.tab_type === "international_national"
      )
      .map((b) => b.international_national)
      .find(Boolean) || null;

  const internationalPlacements = Array.isArray(intlNational?.international_placements)
    ? intlNational.international_placements
    : [];
  const nationalPlacements = Array.isArray(intlNational?.national_placements)
    ? intlNational.national_placements
    : [];

  const renderLogos = (blockLogos) => (
    <div className="container placements-logos-wrapper">
      {recruitersLabel && (
        <p className="placements-logos-label">{recruitersLabel}</p>
      )}
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          320:  { slidesPerView: 2, slidesPerGroup: 2 },
          640:  { slidesPerView: 3, slidesPerGroup: 2 },
          1024: { slidesPerView: 5, slidesPerGroup: 2 },
          1280: { slidesPerView: 6, slidesPerGroup: 2 },
        }}
        spaceBetween={20}
      >
        {blockLogos.map((logo, idx) => (
          <SwiperSlide key={idx}>
            <div className="placements-logo-slide">
              <SafeImage
                src={resolveImage(logo.image || logo.src)}
                alt={logo.alt || `Recruiter ${idx + 1}`}
                className="placements-logo-img"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  const renderHighlights = (blockHighlights) => (
    <div className="placements-grid">
      {blockHighlights.map((item, index) => (
        <div key={index} className="placements-item">
          <RichTextRenderer html={item.description} />
        </div>
      ))}
    </div>
  );

  return (
    <section
      className="placements-section"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container">
        <h2 className="heading">
          <hr className="heading-line" />
          {header.heading}
        </h2>
        {(header.description || header.paragraph) && (
          <RichTextRenderer html={header.description || header.paragraph} />
        )}
      </div>

      {optionalContent.length > 0
        ? optionalContent.map((block, i) => {
            if (block?._section_enabled === false) return null;
            if (block?.tab_type === "logos" && block.logos?.length > 0)
              return <React.Fragment key={i}>{renderLogos(block.logos)}</React.Fragment>;
            if (block?.highlights?.length > 0)
              return <React.Fragment key={i}>{renderHighlights(block.highlights)}</React.Fragment>;
            return null;
          })
        : (
          <>
            {highlights.length > 0 && renderHighlights(highlights)}
            {logos.length > 0 && renderLogos(logos)}
          </>
        )
      }

      {/* International & National placements (SAHS) */}
      {(internationalPlacements.length > 0 || nationalPlacements.length > 0) && (
        <div className="container" style={{ marginTop: "1.5rem" }}>

          {/* International — large logos in a row (no card background) */}
          {internationalPlacements.length > 0 && (
            <div className="mb-14">
              <h3 className="text-xl sm:text-2xl font-bold text-[#269BFF] mb-8">
                International Placements
              </h3>
              <div className="flex flex-wrap items-center justify-around gap-8">
                {internationalPlacements.map((logo, idx) => (
                  <SafeImage
                    key={idx}
                    src={resolveImage(logo.image || logo.src)}
                    alt={`International placement ${idx + 1}`}
                    className="h-24 sm:h-28 w-auto object-contain"
                  />
                ))}
              </div>
            </div>
          )}

          {/* National — white logo cards in a grid */}
          {nationalPlacements.length > 0 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#132F5C] mb-6">
                National Placements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {nationalPlacements.map((logo, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-5 h-32"
                  >
                    <SafeImage
                      src={resolveImage(logo.image || logo.src)}
                      alt={`National placement ${idx + 1}`}
                      className="max-h-20 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
