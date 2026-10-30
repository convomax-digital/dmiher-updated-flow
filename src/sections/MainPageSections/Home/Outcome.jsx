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

  // Each "icons" entry is ONE slide holding every logo it carries — the same
  // single panel the live site shows. These used to be split into 16-logo
  // chunks, which turned one logo wall into several near-identical slides;
  // the grid now shrinks its rows to fit instead (see .icons-grid).
  const renderSlides = slides.map((slide) =>
    slide?.tab_type === "icons"
      ? {
          type: "icons",
          icons: Array.isArray(slide.icons) ? slide.icons : [],
          // CMS spells the field "lable".
          caption: slide.lable || slide.label || slide.title || "",
          bg: slide.bg_color,
        }
      : { type: "image", slide }
  );

  const hasMultipleSlides = renderSlides.length > 1;
  const enableLoop = renderSlides.length >= 3;

  //  Thumbnail Fix (handle string / array / fallback)
  const thumbnail = Array.isArray(videoData?.thumbnail)
    ? videoData.thumbnail[0]
    : videoData?.thumbnail || "";

  //  Extract YouTube ID (supports full URL or ID)
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

              {/*  IMAGE SLIDE */}
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

              {/*  ICON SLIDE (one chunk of up to 16 logos) */}
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
                    {/* CMS spells the field "lable". The caption fills the
                        remaining cells of the last row so any icon count lines
                        up cleanly with the 4-column grid — 4/8/12/16 icons →
                        caption spans a full new row (4 cols), otherwise it
                        spans (4 - count % 4) cells to finish the current row. */}
                    {rs.caption && (
                      <div
                        className="icons-text"
                        style={{
                          gridColumn: `span ${
                            (4 - (rs.icons.length % 4)) % 4 || 4
                          } / span ${
                            (4 - (rs.icons.length % 4)) % 4 || 4
                          }`,
                        }}
                      >
                        <p>{rs.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/*  VIDEO SECTION */}
        {youtubeId && (
          <div className="video-section">
            {videoHeading && (
              <h2 className="video-heading font-oswald-medium uppercase">
                <hr className="w-16 border-[#91288D] mb-2 border-t-4" />
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
 
    
