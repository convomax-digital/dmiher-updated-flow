import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import RichTextRenderer from "../../components/RichTextRenderer";
import SafeImage from "../../components/SafeImage";
import resolveImage from "../../utils/resolveImage";

/**
 * NursingAdvantage — unique colorful 9-card carousel for Nursing pages.
 *
 * Section key: nursing_advantage
 * Data shape:
 *   {
 *     header: { heading: "THE DMIHER\nNURSING ADVANTAGE" },
 *     cards: [
 *       {
 *         text:        "<HTML markup with spans for size/weight variants>",
 *         image:       "assets/.../optional.png",   // optional logo/icon inside card
 *         bg_color:    "#132F5C",
 *         text_color:  "#C77ABF"
 *       },
 *       ...
 *     ]
 *   }
 *
 * Mirrors `D:\UpdatedProjectDM\live site\sections\Nursing\AdventureNursing.jsx`:
 *   - 4 slides per view on desktop, 2 on tablet, 1 on mobile
 *   - Autoplay 3s loop
 *   - Custom pagination dots
 *   - Each card 250x320 with shadow + rounded corners
 *   - Card text rendered as HTML so the live JSX's <span> styling survives
 */
export default function NursingAdvantage({ data }) {
  const heading = data?.header?.heading || "THE DMIHER NURSING ADVANTAGE";
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  if (!cards.length) return null;

  return (
    <div className="px-5 py-5 md:py-12 md:px-10 bg-[#FAFAF6] flex justify-center">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-normal text-[#555555] font-[500] mb-10 whitespace-pre-line">
          <div className="border-t-4 border-[#7E2279] w-20 mb-2"></div>
          {heading}
        </h2>

        <div className="w-full max-w-6xl">
          <div className="relative">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              slidesPerView={1}
              centeredSlides={true}
              pagination={{
                el: ".nursing-advantage-pagination",
                clickable: true,
              }}
              breakpoints={{
                640: { slidesPerView: 2, centeredSlides: false },
                1024: { slidesPerView: 4, centeredSlides: false },
              }}
            >
              {cards.map((card, index) => (
                <SwiperSlide key={index} className="!flex !justify-center">
                  <div
                    className="w-[250px] h-[320px] p-4 rounded-xl shadow-md font-oswald-light flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: card.bg_color || "#FFFFFF",
                      color: card.text_color || "#132F5C",
                    }}
                  >
                    {card.image && (
                      <SafeImage
                        src={resolveImage(card.image)}
                        alt=""
                        className="mx-auto block w-40 mb-2"
                      />
                    )}
                    <RichTextRenderer
                      html={card.text || ""}
                      className="font-oswald-medium text-center"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="nursing-advantage-pagination mt-6 flex justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
}
