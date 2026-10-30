import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { resolveImage } from "../../../utils/resolveImage";

const HighlightCard = ({ item }) => (
  <div
    className={`rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col justify-center md:justify-between w-[90%] sm:w-64 md:w-60 min-h-[380px] sm:min-h-[320px] mx-auto`}
    style={{ background: item.bg_color || item.bg || "#ffffff" }}
  >
    {item.description ? (
      // New shape: card body is a single rich-text HTML block.
      <div
        className="p-4 text-center flex-3 flex flex-col justify-center"
        dangerouslySetInnerHTML={{ __html: item.description }}
      />
    ) : (
      // Legacy shape: structured title / subtitle / image / centerTitle.
      <div className="p-4 text-center flex-3 flex flex-col justify-start">
        {item.title && (
          <h3
            className="mb-1 text-6xl font-bold font-HelveticaLTStd-BoldCond"
            style={{ color: item.titleColor || "#91288D" }}
          >
            {item.title}
            {item.superscript && (
              <sup className="align-super text-xl font-bold">{item.superscript}</sup>
            )}
          </h3>
        )}
        {item.subtitle && (
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: item.titleColor || "#91288D" }}
          >
            {item.subtitle}
          </p>
        )}
        {item.image && (
          <div className="flex-grow flex items-center justify-center mt-2">
            <img
              src={resolveImage(item.image)}
              alt={item.title || "highlight"}
              className="mx-auto object-contain max-h-24"
            />
          </div>
        )}
        {item.centerTitle && (
          <h4 className="flex-grow flex items-center text-green-600 text-6xl font-bold font-oswald-medium justify-center">
            {item.centerTitle}
          </h4>
        )}
      </div>
    )}

    {item.footerText && (
      <div
        className="h-24 text-white text-lg font-normal p-2 text-center flex items-center justify-center"
        style={{ background: item.footerBg || "#132F5C" }}
      >
        <p className="leading-snug line-clamp-3">{item.footerText}</p>
      </div>
    )}
  </div>
);

const WhyStudyAdmissions = ({ data }) => {
  const heading =
    data?.basic?.heading || data?.heading || "WHY STUDY AT DMIHER (DU) ?";
  const highlights = data?.highlights || [];

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTimeout(() => setIsVisible(true), 100);
      },
      { threshold: 0.3 }
    );
    const cur = sectionRef.current;
    if (cur) observer.observe(cur);
    return () => {
      if (cur) observer.unobserve(cur);
    };
  }, []);

  if (!highlights.length) return null;

  return (
    <section ref={sectionRef} className="pt-10 bg-[#FAFAF6] flex justify-center">
      <div className="w-full mx-auto max-w-7xl px-5">
        <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-wide text-[#555555] font-[500] mb-10 whitespace-pre-line">
          <div className="border-t-4 border-[#91288D] w-20 mb-2"></div>
          {heading}
        </h2>

        <div className="relative pb-16 max-w-5xl mx-auto">
          {isVisible && (
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              spaceBetween={20}
              pagination={{ el: ".why-study-pagination", clickable: true }}
              loop={true}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
            >
              {highlights.map((item, index) => (
                <SwiperSlide key={index} className="flex justify-center">
                  <HighlightCard item={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="why-study-pagination flex justify-center mt-6" />
        </div>
      </div>
    </section>
  );
};

export default WhyStudyAdmissions;
