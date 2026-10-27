import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SafeImage from "../../../components/SafeImage";

const ActivitiesAndAnnouncements = ({ data }) => {
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);

  return (
    <section
      className="alumni-activities-section"
      style={{ backgroundColor: data?.basic?.bg_color || "#F3DCF0" }}
    >
      <div className="alumni-activities-container">

        {/* Header */}
        <h2 className="alumni-activities-heading">
          <hr className="alumni-activities-heading-line" />
          {data?.basic?.title || "ACTIVITIES AND ANNOUNCEMENTS"}
        </h2>

        <Swiper pagination={{ clickable: true }} modules={[Pagination]}>
          <SwiperSlide>
            <div className="alumni-activities-grid">

              {/* News */}
              <div className="alumni-activities-card">
                <div className="alumni-activities-card-header">
                  <h3 className="alumni-activities-card-title">News</h3>
                  <button
                    onClick={() => setIsNewsModalOpen(true)}
                    className="alumni-activities-view-all"
                  >
                    VIEW ALL
                  </button>
                </div>

                {data?.news?.map((item, idx) => (
                  <div key={idx} className="alumni-activities-news-item">
                    <p className="alumni-activities-news-title">{item.title}</p>
                    <p className="alumni-activities-news-date">{item.date}</p>
                  </div>
                ))}
              </div>

              {/* Events */}
              <div className="alumni-activities-card">
                <div className="alumni-activities-card-header">
                  <h3 className="alumni-activities-card-title">Events</h3>
                  <button
                    onClick={() => setIsEventsModalOpen(true)}
                    className="alumni-activities-view-all"
                  >
                    VIEW ALL
                  </button>
                </div>

                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 4000 }}
                  loop
                >
                  {data?.events?.map((event, idx) => (
                    <SwiperSlide key={idx}>
                      <SafeImage
                        src={event.image}
                        alt="event"
                        className="alumni-activities-event-img"
                      />
                      <p className="alumni-activities-event-desc">
                        {event.description}
                      </p>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

            </div>
          </SwiperSlide>
        </Swiper>

        {/* News Modal */}
        {isNewsModalOpen && typeof document !== "undefined" &&
          createPortal(
          <div
            className="alumni-activities-modal-overlay"
            onClick={() => setIsNewsModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="alumni-activities-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsNewsModalOpen(false)}
                className="alumni-activities-modal-close"
              >
                <X size={20} />
              </button>
              <h3 className="alumni-activities-modal-title">All News</h3>
              {data?.news?.map((item, idx) => (
                <div key={idx}>
                  <p>{item.title}</p>
                  <p className="alumni-activities-news-date">{item.date}</p>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

        {/* Events Modal */}
        {isEventsModalOpen && typeof document !== "undefined" &&
          createPortal(
          <div
            className="alumni-activities-modal-overlay"
            onClick={() => setIsEventsModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="alumni-activities-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsEventsModalOpen(false)}
                className="alumni-activities-modal-close"
              >
                <X size={20} />
              </button>
              <h3 className="alumni-activities-modal-title">All Events</h3>
              {data?.events?.map((event, idx) => (
                <div key={idx}>
                  <SafeImage src={event.image} className="rounded mb-2" alt="event" />
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
};

export default ActivitiesAndAnnouncements;
