import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";

/**
 * NursingTestimonial — unique component matching live-site Nursing pages.
 *
 * Data shape (section_key: nursing_testimonials):
 *   {
 *     header: { heading: "TESTIMONIALS" },
 *     tabs: [
 *       {
 *         tab: "Students",
 *         items: [
 *           { img, para, name, info }   // info supports \n for line breaks
 *         ]
 *       },
 *       ...
 *     ]
 *   }
 *
 * Mirrors `D:\UpdatedProjectDM\live site\sections\Nursing\TestimonialsNursing.jsx`:
 *   - Tab pills with right-divider between
 *   - Swiper carousel with auto-slide
 *   - Circular avatar (w-45 h-45) on the left
 *   - Paragraph + bold name + <pre>-rendered multi-line info
 */
export default function NursingTestimonial({ data }) {
  const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
  const heading = data?.header?.heading || "TESTIMONIALS";

  const [activeTabName, setActiveTabName] = useState(tabs[0]?.tab);

  if (!tabs.length) return null;

  const activeTab = tabs.find((t) => t.tab === activeTabName) || tabs[0];
  const items = Array.isArray(activeTab?.items) ? activeTab.items : [];

  return (
    <div className="px-5 py-10 bg-[#F4F4F4]">
      <div className="container">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-500 font-oswald-medium mb-4">
          <hr className="border-red-500 border-2 w-12 mb-2" />
          {heading}
        </h2>

        {/* Tab buttons */}
        <div className="text-center flex justify-center pb-8 gap-4 flex-wrap">
          {tabs.map((t, idx) => {
            const isActive = activeTabName === t.tab;
            return (
              <button
                key={t.tab || idx}
                onClick={() => setActiveTabName(t.tab)}
                className={`px-3 py-1 text-sm sm:text-base transition-all ${
                  isActive
                    ? "underline text-black"
                    : "text-gray-500 hover:text-gray-700"
                } ${
                  idx < tabs.length - 1
                    ? "border-r border-gray-300 pr-4"
                    : ""
                }`}
              >
                {t.tab}
              </button>
            );
          })}
        </div>

        {/* Swiper carousel */}
        <Swiper
          style={{ paddingBottom: 80 }}
          slidesPerView={"auto"}
          centeredSlides
          spaceBetween={30}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {items.map((t, i) => (
            <SwiperSlide key={i} className="pb-5">
              <div className="flex items-center justify-center gap-12 max-sm:flex-col">
                {t.img && (
                  <SafeImage
                    src={resolveImage(t.img)}
                    alt={t.name || "testimonial"}
                    className="w-45 h-45 object-cover rounded-full"
                  />
                )}
                <div className="max-w-xl font-[Arial] text-base">
                  <p className="mb-4 text-[#555555]">{t.para}</p>
                  {t.name && (
                    <p className="font-[600] text-base mt-1">{t.name}</p>
                  )}
                  {t.info && (
                    <pre className="font-[Arial] text-[#555555] leading-5 mt-2 whitespace-pre-wrap">
                      {t.info}
                    </pre>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
          {items.length === 0 && (
            <SwiperSlide>
              <div className="text-center text-gray-500 py-16">
                No testimonials yet.
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    </div>
  );
}
