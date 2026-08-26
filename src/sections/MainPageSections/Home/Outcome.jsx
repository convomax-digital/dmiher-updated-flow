import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { PlayCircle } from "../../../components/icons";
import RichTextRenderer from "../../../components/RichTextRenderer";
import SafeImage from "../../../components/SafeImage";
const Outcome = ({ data }) => {
  const [playVideo, setPlayVideo] = useState(false);

  if (!data?.slider || data.slider.length === 0) return null;

  // The video arrives either as a legacy `data.video` object or (current CMS
  // shape) as a slider entry with tab_type "video". It renders as the
  // standalone section below the carousel, never as a slide.
  const videoData =
    data.video || data.slider.find((s) => s?.tab_type === "video") || null;
  const slides = data.slider.filter((s) => s?.tab_type !== "video");

  // Expand each "icons" slide into logo-chunk sub-slides: a 4-column grid holds
  // 16 logos cleanly (4 rows), so a longer logo list paginates onto new slides
  // (same bg, swiper dots) instead of overflowing one grid — mirroring the
  // FootprintSection ("OUR TALENT ACROSS INDUSTRIES") logo slider. The caption
  // repeats on every chunk so each slide reads as a complete panel.
  const LOGOS_PER_SLIDE = 16;
  const renderSlides = [];
  slides.forEach((slide) => {
    if (slide?.tab_type === "icons") {
      const icons = Array.isArray(slide.icons) ? slide.icons : [];
      const caption = slide.lable || slide.label || slide.title || "";
      const bg = slide.bg_color;
      if (icons.length <= LOGOS_PER_SLIDE) {
        renderSlides.push({ type: "icons", icons, caption, bg });
      } else {
        for (let i = 0; i < icons.length; i += LOGOS_PER_SLIDE) {
          renderSlides.push({
            type: "icons",
            icons: icons.slice(i, i + LOGOS_PER_SLIDE),
            caption,
            bg,
          });
        }
      }
    } else {
      renderSlides.push({ type: "image", slide });
    }
  });

  const hasMultipleSlides = renderSlides.length > 1;
  const enableLoop = renderSlides.length >= 3;

  // ✅ Thumbnail Fix (handle string / array / fallback)
  const thumbnail = Array.isArray(videoData?.thumbnail)
    ? videoData.thumbnail[0]
    : videoData?.thumbnail || "";

  // ✅ Extract YouTube ID (supports full URL or ID)
  const getYoutubeId = (url) => {
    if (!url) return "";
    if (url.length === 11) return url;

    const regExp =
      /^.*(youtu.be\/|v\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = url.match(regExp);
    return match ? match[2] : "";
  };

  const youtubeId = getYoutubeId(videoData?.youtube_id);
  const videoHeading = videoData?.heading || "";

  return (
    <div className="container">
      <div className="outcome-inner">

        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          loop={enableLoop}
          autoplay={
            hasMultipleSlides
              ? { delay: 4000, disableOnInteraction: false }
              : false
          }
          pagination={hasMultipleSlides ? { clickable: true } : false}
          className="outcome-swiper"
        >
          {renderSlides.map((rs, index) => (
            <SwiperSlide key={index}>

              {/* ✅ IMAGE SLIDE */}
              {rs.type === "image" && (
                <div className="slide-image">
                  <SafeImage
                    src={rs.slide.image}
                    alt="slide"
                    className="slide-img"
                  />
                  <div className="slide-overlay" />
                  <div className="slide-content">
                    <RichTextRenderer html={rs.slide.desc} />
                  </div>
                </div>
              )}

              {/* ✅ ICON SLIDE (one chunk of up to 16 logos) */}
              {rs.type === "icons" && (
                <div
                  className="slide-icons"
                  style={{ backgroundColor: rs.bg }}
                >
                  <div className="icons-grid">
                    {rs.icons.map((item, i) => (
                      <SafeImage
                        key={i}
                        src={item.image}
                        alt={`icon-${i}`}
                        className="icon-img"
                      />
                    ))}
                    {/* CMS spells the field "lable"; the text fills the grid
                        cells after the last logo (col-span-2), matching the
                        live "LEARN FROM THE GLOBAL LEADERS" design. */}
                    {rs.caption && (
                      <div className="icons-text">
                        <p>{rs.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ VIDEO SECTION */}
        {youtubeId && (
          <div className="video-section">
            {videoHeading && (
              <h2 className="video-heading font-oswald-medium uppercase">
                <hr className="w-16 border-[#F04E30] mb-2 border-t-4" />
                {videoHeading}
              </h2>
            )}
            {!playVideo ? (
              <div
                className="video-thumbnail-wrapper"
                onClick={() => setPlayVideo(true)}
              >
                <SafeImage
                  src={
                    thumbnail ||
                    `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                  }
                  alt="Video Thumbnail"
                  className="video-thumbnail"
                />
                <div className="play-icon">
                  <PlayCircle size={60} />
                </div>
              </div>
            ) : (
              <iframe
                className="video-iframe"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="YouTube Video"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default Outcome;
 
    
