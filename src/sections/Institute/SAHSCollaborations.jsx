import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import LucideIcons from "../../utils/lucideIcons";

import resolveImage from "../../utils/resolveImage";

/**
 * SAHS Collaborations
 * ----------------------------------------------------------------------
 * Dedicated section for SAHS (Allied Health Sciences) — Wardha & Nagpur.
 *   - "Your Gateway to a Global Healthcare Career" title
 *   - "COLLABORATIONS" sub-heading + intro paragraph (header.description)
 *   - National Developmental Partners (autoplay swiper, 5/view)
 *   - International Developmental Partners (flex-wrap grid w/ name labels)
 *   - "Max Healthcare Education Advantage" panel — shown only when
 *     data.max_section.show_max_healthcare === true. 8 feature cards +
 *     right-side blurb + CTA.
 *
 * API data shape:
 * {
 *   header: { heading, sub_heading, description },
 *   national_partners: [{ logo }],
 *   international_partners: [{ logo, name }],
 *   max_section: { show_max_healthcare: bool },
 *   max_healthcare: {
 *     title, subtitle, partner_label, description, cta_label, cta_link,
 *     features: [{ icon, title, bg_color }]
 *   }
 * }
 */

// Resolve a CMS icon string (e.g. "users", "user-check", "bar-chart-3")
// to a Lucide component by PascalCasing it. Falls back to Star.
const resolveIcon = (name) => {
  const fallback = LucideIcons.Star;
  if (!name) return fallback;
  const pascal = String(name)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return LucideIcons[pascal] || fallback;
};

// Tailwind pastel class → hex (JIT purges dynamic DB classes; map to hex).
const BG_HEX = {
  "bg-rose-200": "#fecdd3",
  "bg-green-200": "#bbf7d0",
  "bg-purple-200": "#e9d5ff",
  "bg-blue-200": "#bfdbfe",
  "bg-cyan-200": "#a5f3fc",
  "bg-indigo-200": "#c7d2fe",
  "bg-lime-200": "#d9f99d",
  "bg-pink-200": "#fbcfe8",
  "bg-amber-200": "#fde68a",
  "bg-teal-200": "#99f6e4",
};

const FeatureCard = ({ icon, title, bg_color }) => {
  const Icon = resolveIcon(icon);
  // Accept a known tailwind class, a raw hex, or fall back to rose.
  const bg = BG_HEX[bg_color] || (bg_color?.startsWith("#") ? bg_color : "#fecdd3");
  return (
    <div
      className="sahs-collab-feature rounded-lg p-6 flex flex-col items-center text-center h-44 justify-center"
      style={{ backgroundColor: bg }}
    >
      <div className="sahs-collab-feature-icon bg-white rounded-lg p-4 mb-4 shadow-md">
        <Icon className="w-8 h-8 text-teal-500" />
      </div>
      <h3 className="text-gray-800 font-medium text-base leading-tight">
        {title}
      </h3>
    </div>
  );
};

export default function SAHSCollaborations({ data }) {
  if (!data) return null;

  // Header fields are nested under `header`; keep flat fallbacks for safety.
  const header = data.header || {};
  const heading =
    header.heading || data.heading ;
  const subHeading = header.sub_heading || data.sub_heading ;
  const description = header.description || data.description || "";

  const nationalPartners = Array.isArray(data.national_partners)
    ? data.national_partners
    : [];
  const internationalPartners = Array.isArray(data.international_partners)
    ? data.international_partners
    : [];

  // Optional Max Healthcare panel. Toggle now lives at
  // max_healthcare._section_enabled; older shapes kept as fallbacks.
  const showMax = !!(
    data.max_healthcare?._section_enabled ??
    data.max_section?.show_max_healthcare ??
    data.show_max_healthcare ??
    false
  );
  const max = data.max_healthcare || {};
  const features = Array.isArray(max.features) ? max.features : [];

  return (
    <section className="sahs-collab-section bg-[#f7fafd] py-20">
      <h1 className="sahs-collab-title text-2xl sm:text-3xl md:text-4xl font-[500] font-oswald-medium text-[#555555] uppercase leading-snug mb-6 text-center">
        {heading}
      </h1>

      <div className="container">
        {/* Sub-heading + intro. Prefer the rich `description` (it already
            contains the "Collaborations" heading + paragraph); fall back to a
            plain sub-heading when no description is set. */}
        <div className="mb-12">
          <hr className="w-16 sm:w-20 border-[#91288D] mb-4 border-t-4" />
          {description ? (
            <div
              className="sahs-collab-description text-[#555555] font-[Arial]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <h2 className="sahs-collab-heading text-3xl md:text-4xl font-[500] text-[#555555] uppercase font-oswald-medium leading-tight">
              {subHeading}
            </h2>
          )}
        </div>

        {/* National Partners */}
        {nationalPartners.length > 0 && (
          <div className="mb-14">
            <h3 className="sahs-collab-partners-heading text-xl sm:text-2xl font-bold text-[#132F5C] mb-6 text-center">
              National Developmental Partners
            </h3>
            <Swiper
              modules={[Autoplay, Pagination]}
              style={{ paddingBottom: "3rem", cursor: "grab" }}
              slidesPerView={5}
              loop={nationalPartners.length > 5}
              autoplay={{ delay: 1800, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {nationalPartners.map((p, idx) => (
                <SwiperSlide key={idx} className="pb-5">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-lg flex items-center justify-center mb-2">
                      <img
                        src={resolveImage(p.logo)}
                        alt={p.name || ""}
                        className="sahs-collab-partner-logo h-20 w-auto object-contain"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* International Partners */}
        {internationalPartners.length > 0 && (
          <div className="mb-14">
            <h3 className="sahs-collab-partners-heading text-xl sm:text-2xl font-bold text-[#269BFF] mb-6 text-center">
              International Developmental Partners
            </h3>
            <div className="sahs-collab-intl-partners flex flex-wrap justify-center gap-8">
              {internationalPartners.map((p, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center"
                >
                  <div className="sahs-collab-intl-card bg-white rounded-lg shadow p-3 mb-2 flex items-center justify-center">
                    <img
                      src={resolveImage(p.logo)}
                      alt={p.name || ""}
                      className="h-20 object-contain mx-auto"
                    />
                  </div>
                  <span className="text-xs text-[#555555] font-semibold">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Max Healthcare Advantage — optional (max_section.show_max_healthcare) */}
        {showMax && (
          <div className="sahs-collab-max bg-white rounded-xl shadow-lg px-4 md:px-8 py-10">
            <div className="text-center mb-10">
              <h1 className="sahs-collab-max-title text-4xl md:text-5xl font-bold text-blue-800 mb-2">
                {max.title || "Max Healthcare Education"}
              </h1>
              <h2 className="sahs-collab-max-subtitle text-3xl md:text-4xl font-bold text-teal-500">
                {max.subtitle || "Advantage"}
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="lg:w-3/5 w-full flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  {features.map((f, i) => (
                    <FeatureCard
                      key={i}
                      icon={f.icon}
                      title={f.title}
                      bg_color={f.bg_color}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:w-2/2 w-full">
                {/* <h4 className="font-bold text-[#555555] text-lg mb-2">
                  {max.partner_label ||
                    "Skills and Knowledge Partner: Max Healthcare Education"}
                </h4> */}
                {max.description && (
                  <p
                    className="text-[#555555] text-sm mb-4"
                    dangerouslySetInnerHTML={{ __html: max.description }}
                  />
                )}
                {(max.cta_label || max.cta_link) && (
                  <div className="pt-2 flex justify-center">
                    <a
                      href={(max.cta_link || "/programs").trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#91288D] hover:bg-[#132F5C] text-white font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                      {(max.cta_label || "Explore Programs").trim()}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
