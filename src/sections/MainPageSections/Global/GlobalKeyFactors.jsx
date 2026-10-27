import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SafeImage from "../../../components/SafeImage";
import resolveImage from "../../../utils/resolveImage";

const GlobalKeyFactors = ({ data }) => {
  const heading = data?.heading || "KEY FACTORS";
  const subheading = data?.subheading || "That drive our global impact";
  const cards = data?.cards || [];

  if (!cards.length) return null;

  return (
    <div className="px-5 py-8 md:py-15 md:px-10 bg-[#FAF1F9] flex justify-center">
      <div className="w-full container">
        <div className="mb-10">
          <div className="border-t-4 border-[#91288D] w-20 mb-4"></div>
          <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-normal text-[#555555] font-[500]">
            {heading}
          </h2>
          {subheading && (
            <p className="text-xl text-[#132F5C] font-oswald-light mt-2">
              {subheading}
            </p>
          )}
        </div>

        <Swiper
          modules={[Autoplay]}
          loop={true}
          speed={600}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          spaceBetween={20}
          slidesPerView={1}
          style={{ paddingBottom: "3rem" }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {cards.map((card, i) => {
            const bg = card.bg_color || "#269BFF";
            const titleColor = card.title_color || "#132F5C";
            return (
              <SwiperSlide key={i}>
                <div
                  className="p-6 rounded-lg shadow-md min-h-[300px] w-[220px] flex flex-col justify-center relative"
                  style={{ backgroundColor: bg, color: "#fff" }}
                >
                  {card.icon && (
                    <div className="absolute right-2 top-2 w-16">
                      <SafeImage src={resolveImage(card.icon)} alt="" className="w-full" />
                    </div>
                  )}
                  <div>
                    <h3
                      className="font-oswald-medium font-bold text-3xl mb-3 whitespace-pre-line"
                      style={{ color: titleColor }}
                    >
                      {card.title}
                    </h3>
                    <p className="font-oswald-light text-sm leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default GlobalKeyFactors;
