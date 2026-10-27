import React from "react";
import { Award, ExternalLink, Heart } from "lucide-react";
import RichTextRenderer from "../../../../components/RichTextRenderer";
import SafeImage from "../../../../components/SafeImage";
import { renderIcon } from "../../../../utils/renderIcon";

/**
 * Sports Facilities — section_id `sports_facilities`.
 *
 * Backend-driven, mirroring the live-site Sports layout
 * (live: pages/MicroPages/About/SportsFacilitiesAbout.jsx). Data shape:
 *   {
 *     hero:         { heading, description(HTML) },
 *     commitment:   { title, icon, description(HTML) },
 *     partnerships: { heading, subtitle, cards:[{ icon, title, badge, button_text, url }] },
 *     gallery:      { heading, subtitle, images:[{ image, caption, _disabled:{caption} }] }
 *   }
 * Every section renders only when the CMS provides it.
 */
const arr = (v) => (Array.isArray(v) ? v : []);

export default function SportsFacilities({ data = {} }) {
  const hero = data.hero || {};
  const commitment = data.commitment || {};
  const partnerships = data.partnerships || {};
  const gallery = data.gallery || {};
  const cards = arr(partnerships.cards);
  const images = arr(gallery.images);

  if (!data.hero && !data.commitment && !data.partnerships && !data.gallery) {
    return null;
  }

  return (
    <div className="sports-facilities-page bg-white">
      {/* HERO */}
      {(hero.heading || hero.description) && (
        <div className="container py-14">
          <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] tracking-wide uppercase font-oswald-medium">
            <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
            {hero.heading}
          </h2>
          {hero.description && (
            <RichTextRenderer className="mt-2" html={hero.description} />
          )}
        </div>
      )}

      {/* COMMITMENT */}
      {(commitment.title || commitment.description) && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="sports-commitment-icon w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0">
                {renderIcon(commitment.icon, 24, "text-white") || (
                  <Heart className="w-6 h-6" />
                )}
              </div>
              {commitment.title && (
                <h2 className="sports-heading-navy text-2xl md:text-3xl font-bold">
                  {commitment.title}
                </h2>
              )}
            </div>
            {commitment.description && (
              <RichTextRenderer
                className="text-base md:text-lg leading-relaxed text-[#555555]"
                html={commitment.description}
              />
            )}
          </div>
        </div>
      )}

      {/* PARTNERSHIPS */}
      {cards.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              {partnerships.heading && (
                <h2 className="sports-heading-navy text-3xl md:text-4xl font-bold mb-3">
                  {partnerships.heading}
                </h2>
              )}
              {partnerships.subtitle && (
                <p className="sports-text-muted text-lg">
                  {partnerships.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="sports-partner-icon w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0">
                      {renderIcon(card.icon, 24, "text-white") || (
                        <Award className="w-6 h-6" />
                      )}
                    </div>
                    {card.badge && (
                      <span className="sports-badge inline-block px-3 py-1 rounded-full text-sm font-semibold">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {card.title && (
                    <h3 className="sports-heading-navy text-lg font-semibold mb-4">
                      {card.title}
                    </h3>
                  )}

                  {card.url && (
                    <div className="flex justify-end">
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sports-view-link inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity duration-300 hover:opacity-80"
                      >
                        {card.button_text || "View Link"}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GALLERY */}
      {images.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              {gallery.heading && (
                <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] font-oswald-medium uppercase">
                  <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
                  {gallery.heading}
                </h2>
              )}
              {gallery.subtitle && (
                <p className="mt-2 text-[#555555]">{gallery.subtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, i) => {
                const showCaption =
                  img?.caption && img?._disabled?.caption !== true;
                return (
                  <figure
                    key={i}
                    className="relative rounded overflow-hidden shadow-md group"
                  >
                    <SafeImage
                      src={img.image}
                      alt={img.caption || ""}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Live-site style: caption sits ON the image as a dark
                        bottom bar (see SportsFacilitiesAbout.jsx on live). */}
                    {showCaption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 pt-8 pb-3 text-white text-sm font-semibold">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
