import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SafeImage from "../../../components/SafeImage";
import resolveImage from "../../../utils/resolveImage";

const GlobalExchange = ({ data }) => {
  const heading = data?.heading || "STUDENT EXCHANGE";
  const slides = data?.slides || [];

  const [swiper, setSwiper] = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateNav = (s) => {
    if (!s) return;
    setAtStart(s.isBeginning);
    setAtEnd(s.isEnd);
  };

  if (!slides.length) return null;

  return (
    <section className="container py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#555555] mb-8 font-oswald-medium font-[500] tracking-tight leading-tight">
        <span className="block border-t-4 border-[#91288D] w-20 sm:w-24 mb-2"></span>
        {heading}
      </h2>

      <div className="flex gap-2 justify-end mb-4">
        <button
          onClick={() => swiper?.slidePrev()}
          disabled={atStart}
          className={`border p-2 rounded-full transition ${atStart ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          aria-label="Previous"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => swiper?.slideNext()}
          disabled={atEnd}
          className={`border p-2 rounded-full transition ${atEnd ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          aria-label="Next"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={24}
        onSwiper={(s) => { setSwiper(s); updateNav(s); }}
        onSlideChange={(s) => updateNav(s)}
        onResize={(s) => { s.update(); updateNav(s); }}
        className="rounded-xl"
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative">
              <SafeImage
                src={resolveImage(slide.image)}
                alt={slide.title}
                className="w-full h-64 object-cover rounded-xl"
              />
              {slide.title && (
                <p className="absolute bottom-3 left-0 right-0 bg-gradient-to-r from-black/70 to-transparent text-white text-sm py-2 px-4 rounded-b-xl">
                  {slide.title}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default GlobalExchange;
