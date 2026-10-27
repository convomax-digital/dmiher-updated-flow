import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SafeImage from "../../../components/SafeImage";
import RichTextRenderer from "../../../components/RichTextRenderer";

/**
 * AlumniTestimonials — heading + auto-rotating testimonial carousel.
 *
 * Data shape:
 *   basic: { heading }
 *   tabs:  [{ label?, testimonials: [{ name, info, text (HTML), image? }] }]
 *
 * Tab buttons only show when there are 2+ labelled tabs; otherwise all
 * testimonials are flattened into a single carousel.
 *
 * ALTERNATE SHAPE (Museum page): { basic: { title }, testimonial: [{ details }] }
 * where each `details` is old-site HTML scraped into the CMS — it embeds its
 * own swiper markup (sometimes with several .swiper-slide copies) plus a
 * category <button> ("Visitors"). We extract the ACTIVE slide's content per
 * entry and the unique labels, then drive our own carousel with the cleaned
 * slides — rendering the raw markup as-is would nest broken sliders.
 */
const AlumniTestimonials = ({ data }) => {
  const heading =
    data?.basic?.heading || data?.basic?.title || data?.heading || "TESTIMONIALS";
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];

  const labeledTabs = tabs.filter((t) => t?.label);
  const showTabs = labeledTabs.length > 1;

  const [active, setActive] = useState(labeledTabs[0]?.label || "");

  // Labelled tabs → active tab's testimonials. Otherwise flatten all.
  const testimonials = showTabs
    ? (tabs.find((t) => t.label === active) || tabs[0])?.testimonials || []
    : tabs.flatMap((t) => (Array.isArray(t?.testimonials) ? t.testimonials : []));

  // Parse the alternate `testimonial[].details` shape (client-only; DOMParser).
  const detailEntries = Array.isArray(data?.testimonial) ? data.testimonial : [];
  const parsedDetails = useMemo(() => {
    if (!detailEntries.length || typeof window === "undefined") return null;
    const labels = new Set();
    const slides = [];
    detailEntries.forEach((entry) => {
      const html = entry?.details || "";
      if (!html.trim()) return;
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("button").forEach((b) => {
        const t = b.textContent.trim();
        if (t) labels.add(t);
      });
      const slide =
        doc.querySelector(".swiper-slide-active") ||
        doc.querySelector(".swiper-slide");
      if (slide) {
        slides.push(slide.innerHTML);
      } else {
        // No embedded swiper markup — drop the label button row, keep the rest.
        doc
          .querySelectorAll("button")
          .forEach((b) => (b.closest("div") || b).remove());
        const rest = doc.body.innerHTML.trim();
        if (rest) slides.push(rest);
      }
    });
    return { labels: [...labels], slides };
  }, [detailEntries]);

  const detailSlides = parsedDetails?.slides || [];

  if (!testimonials.length && !detailSlides.length) return null;

  return (
    <div className="pt-16 pb-10 flex justify-center" style={{ backgroundColor: "#f4f4f4" }}>
      <div className="mx-auto max-w-7xl w-full px-4">
        <h2 className="text-3xl sm:text-4xl ml-4 md:ml-0 font-[500] font-oswald-medium tracking-wider mb-10 text-[#555555]">
          <hr className="w-12 sm:w-20 border-[#91288D] mb-2 border-t-4" />
          {heading}
        </h2>

        {showTabs && (
          <div className="flex justify-center flex-wrap gap-4 pb-10 text-center">
            {labeledTabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActive(t.label)}
                className={`px-4 py-2 text-sm sm:text-base font-medium transition-all duration-200 ${
                  active === t.label
                    ? "underline text-gray-600"
                    : "text-gray-500 hover:text-gray-700"
                } ${i < labeledTabs.length - 1 ? "border-r border-gray-300 pr-4" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Alternate shape: cleaned slides extracted from testimonial[].details */}
        {!testimonials.length && detailSlides.length > 0 && (
          <div className="my-6">
            {parsedDetails.labels.length > 0 && (
              <div className="flex justify-center flex-wrap gap-4 pb-6 text-center">
                {parsedDetails.labels.map((label) => (
                  <span key={label} className="px-3 py-1 text-base underline text-black">
                    {label}
                  </span>
                ))}
              </div>
            )}
            <Swiper
              style={{ paddingBottom: 60 }}
              slidesPerView={1}
              spaceBetween={30}
              loop={detailSlides.length > 1}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              modules={[Pagination, Autoplay]}
              className="mySwiper"
            >
              {detailSlides.map((html, idx) => (
                <SwiperSlide key={idx}>
                  <div className="max-w-3xl mx-auto text-center text-[16px] text-[#555555] px-4">
                    <RichTextRenderer html={html} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {testimonials.length > 0 && (
        <div className="my-6">
          <Swiper
            style={{ paddingBottom: 60 }}
            slidesPerView={1}
            spaceBetween={30}
            loop={testimonials.length > 1}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="mySwiper"
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className={`flex justify-center items-center gap-10 flex-wrap px-4 ${
                    t.image ? "" : "flex-col"
                  }`}
                >
                  {t.image && (
                    <SafeImage
                      key={t.image}
                      src={t.image}
                      alt={t.name || ""}
                      className="w-52 h-52 object-cover rounded-full"
                    />
                  )}

                  <div
                    className={`text-[16px] text-[#555555] ${
                      t.image ? "max-w-2xl text-left" : "max-w-3xl text-center mx-auto"
                    }`}
                  >
                    {t.text && (
                      <div className="leading-relaxed mb-6">
                        <RichTextRenderer html={t.text} />
                      </div>
                    )}
                    {t.name && (
                      <p className="font-bold text-lg text-[#333] font-oswald-medium">
                        {t.name}
                      </p>
                    )}
                    {t.info && (
                      <p className="text-sm text-[#555555] italic mt-1">
                        {t.info}
                      </p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        )}
      </div>
    </div>
  );
};

export default AlumniTestimonials;
