import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import SafeImage from "../../components/SafeImage";
import RichTextRenderer from "../../components/RichTextRenderer";
import { resolveImage } from "../../utils/resolveImage";
import "swiper/css";
import "swiper/css/pagination";

/**
 * Cadaveric & Wet Lab — reusable lab section.
 * Used twice on /cadaveric-wet-lab (once for the Cadaveric Surgical Skill Lab,
 * once for the Wet Lab). Each instance carries:
 *   • a section heading (e.g. "CADAVERIC SURGICAL SKILL LAB")
 *   • a custom background color (sand for cadaveric, light blue for wet)
 *   • Main-Campus / Off-Campus tabs, each with description, image, officials,
 *     and a "HOLISTIC LEARNING INFRASTRUCTURE" highlight bar.
 *
 * Data shape (section_key: cadwl_lab_section)
 *   {
 *     header: { bg_color: "#fef6ec" },
 *     tabs: [
 *       {
 *         tab_label:   "MAIN CAMPUS – WARDHA",
 *         heading:     "CADAVERIC SURGICAL SKILL LAB",
 *         // location ("Wardha") + Highlights are baked into the description HTML
 *         description: "<h3>Wardha</h3>...<span>Highlights</span><ul>...</ul>",
 *         images:      [{ src: "assets/.../wardha.jpg" }, ...],
 *         // officials is either an array OR a disabled marker { _section_disabled: ["on"] }
 *         officials: [
 *           { role: "Cadaveric Lab Incharge", image, details (HTML w/ name) }
 *         ]
 *       }, ...
 *     ],
 *     holistic: [
 *       {
 *         infra_heading: "HOLISTIC LEARNING INFRASTRUCTURE",
 *         infra: [
 *           { description: "<p><strong>Dedicated well-ventilated space</strong> for...</p>" },
 *           ...
 *         ]
 *       }
 *     ]
 *   }
 */
export default function CadWLLabSection({ data }) {
  if (!data) return null;
  const { header = {}, tabs = [], holistic = [] } = data;
  const bg_color = header.bg_color;
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;
  const current = tabs[active] || tabs[0];
  const heading = current.heading;

  return (
    <section className="cadwl-lab">
      {/* Campus tab pills */}
      <ul className="cadwl-lab-tabs">
        {tabs.map((t, idx) => (
          <li
            key={idx}
            onClick={() => setActive(idx)}
            className={
              "cadwl-lab-tab" +
              (active === idx ? " cadwl-lab-tab-active" : " cadwl-lab-tab-inactive")
            }
          >
            {t.tab_label}
          </li>
        ))}
      </ul>

      {/* Body */}
      <div
        className="cadwl-lab-body"
        style={bg_color ? { backgroundColor: bg_color } : undefined}
      >
        <div className="container">
          {/* Heading */}
          {heading && (
            <h2 className="cadwl-lab-heading">
              <span className="cadwl-lab-heading-line" />
              <span className="cadwl-lab-heading-text">{heading}</span>
            </h2>
          )}

          {/* Description + image carousel */}
          <div className="cadwl-lab-grid">
            <div className="cadwl-lab-text">
              {current.description && (
                <div className="cadwl-lab-desc">
                  <RichTextRenderer html={current.description} />
                </div>
              )}
            </div>

            {Array.isArray(current.images) && current.images.length > 0 && (
              <div className="cadwl-lab-imgwrap">
                <Swiper
                  modules={[Pagination]}
                  pagination={{ clickable: true }}
                  slidesPerView={1}
                  loop={current.images.length > 1}
                  className="cadwl-lab-swiper"
                  style={{ paddingBottom: "3rem" }}
                >
                  {current.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <div className="cadwl-lab-slide">
                        <SafeImage
                          src={resolveImage(img?.src || img)}
                          alt={`${current.tab_label || "Lab"} ${i + 1}`}
                          className="cadwl-lab-img"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          {/* Key Officials */}
          {Array.isArray(current.officials) && current.officials.length > 0 && (
            <div className="cadwl-lab-officials-wrap">
              <h3 className="cadwl-lab-officials-heading">Key Officials</h3>
              <div className="cadwl-lab-officials-grid">
                {current.officials.map((o, idx) => (
                  <div key={idx} className="cadwl-lab-official-card">
                    {o.image && (
                      <SafeImage
                        src={resolveImage(o.image)}
                        alt={o.name || "official"}
                        className="cadwl-lab-official-img"
                      />
                    )}
                    <div className="cadwl-lab-official-body">
                      {o.role && (
                        <div className="cadwl-lab-official-role">{o.role}</div>
                      )}
                      <hr className="cadwl-lab-official-rule" />
                      {o.name && (
                        <div className="cadwl-lab-official-name">{o.name}</div>
                      )}
                      {o.details && (
                        <div className="cadwl-lab-official-details">
                          <RichTextRenderer html={o.details} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Holistic Learning Infrastructure boxes — sits OUTSIDE the colored
         body so its background is always white regardless of bg_color. */}
      {holistic.map((group, gIdx) => {
        const infra = Array.isArray(group.infra) ? group.infra : [];
        if (!infra.length) return null;

        // A row holds 4 items; beyond that they used to wrap into a lopsided
        // extra row. Instead, page them 4-at-a-time through a slider (matching
        // the live site) once there are more than 4.
        const perSlide = 4;
        const useSlider = infra.length > perSlide;
        const chunks = [];
        for (let i = 0; i < infra.length; i += perSlide) {
          chunks.push(infra.slice(i, i + perSlide));
        }

        const renderRow = (items) => (
          <ul className="cadwl-lab-infra-grid">
            {items.map((item, idx) => (
              <li
                key={idx}
                className={
                  "cadwl-lab-infra-item" +
                  (idx < items.length - 1
                    ? " cadwl-lab-infra-item-divider"
                    : "")
                }
              >
                {item.description && (
                  <RichTextRenderer html={item.description} />
                )}
              </li>
            ))}
          </ul>
        );

        return (
          <div key={gIdx} className="cadwl-lab-infra-section">
            <div className="container">
              <div className="cadwl-lab-infra-wrap">
                {group.infra_heading && (
                  <h3 className="cadwl-lab-infra-heading">
                    <span className="cadwl-lab-heading-line" />
                    <span style={{ whiteSpace: "pre-line" }}>
                      {group.infra_heading}
                    </span>
                  </h3>
                )}

                {useSlider ? (
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    slidesPerView={1}
                    className="cadwl-lab-infra-swiper"
                  >
                    {chunks.map((chunk, ci) => (
                      <SwiperSlide key={ci}>{renderRow(chunk)}</SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  renderRow(infra)
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
