import React from "react";
import { Award, ChevronRight } from "lucide-react";
import RichTextRenderer from "../../../../components/RichTextRenderer";
import { renderIcon } from "../../../../utils/renderIcon";

/**
 * Institutional Social Responsibility — section_id `institutional_social_responsibility`.
 *
 * Backend-driven, mirroring the live-site ISR layout
 * (live: pages/MicroPages/About-1/ISR.jsx). Data shape:
 *   {
 *     hero:        { heading, description(HTML) },
 *     commitment:  { title, icon, description(HTML) },
 *     initiatives: { heading, subtitle, cards:[{ icon, title, description(HTML), button_text }] },
 *     impact:      { heading, description(HTML) }
 *   }
 * Every section renders only when the CMS provides it.
 */
const arr = (v) => (Array.isArray(v) ? v : []);

export default function InstitutionalSocialResponsibility({ data = {} }) {
  const hero = data.hero || {};
  const commitment = data.commitment || {};
  const initiatives = data.initiatives || {};
  const impact = data.impact || {};
  const cards = arr(initiatives.cards);

  if (!data.hero && !data.commitment && !data.initiatives && !data.impact) {
    return null;
  }

  return (
    <div className="isr-page bg-white">
      {/* HERO */}
      {(hero.heading || hero.description) && (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <div className="container py-16">
            {hero.heading && (
              <h2 className="text-2xl sm:text-3xl 2xl:text-4xl uppercase font-oswald-medium font-[500] text-[#555555] leading-tight">
                <hr className="w-16 sm:w-20 border-[#91288D] mb-4 border-t-4" />
                {hero.heading}
              </h2>
            )}
            {hero.description && (
              <RichTextRenderer
                className="mt-6 max-w-5xl text-base md:text-lg text-[#555555] leading-relaxed"
                html={hero.description}
              />
            )}
          </div>
        </section>
      )}

      {/* COMMITMENT */}
      {(commitment.title || commitment.description) && (
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#91288D]/10 rounded-full mb-6 text-[#91288D]">
              {renderIcon(commitment.icon, 32, "text-[#91288D]") || (
                <Award className="w-8 h-8" />
              )}
            </div>
            {commitment.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-[#555555] font-oswald-medium uppercase">
                {commitment.title}
              </h2>
            )}
            {commitment.description && (
              <RichTextRenderer
                className="mt-3 text-base md:text-lg text-[#555555] leading-relaxed"
                html={commitment.description}
              />
            )}
          </div>
        </section>
      )}

      {/* INITIATIVES */}
      {cards.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="mb-12">
              {initiatives.heading && (
                <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] font-oswald-medium uppercase">
                  <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
                  {initiatives.heading}
                </h2>
              )}
              {initiatives.subtitle && (
                <p className="mt-3 text-xl text-gray-600 max-w-3xl">
                  {initiatives.subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card, i) => (
                <div key={i} className="group h-full">
                  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                    <div className="w-14 h-14 bg-[#91288D] group-hover:bg-[#132F5C] rounded-lg flex items-center justify-center mb-6 text-white transition-all duration-300">
                      {renderIcon(card.icon, 28, "text-white") || (
                        <Award className="w-7 h-7" />
                      )}
                    </div>
                    {card.title && (
                      <h3 className="text-xl font-semibold text-[#555555] mb-4 font-oswald-medium">
                        {card.title}
                      </h3>
                    )}
                    {card.description && (
                      <RichTextRenderer
                        className="text-base text-[#555555] leading-relaxed"
                        html={card.description}
                      />
                    )}
                    {card.button_text && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <span className="text-[#91288D] font-medium text-sm inline-flex items-center gap-1">
                          {card.button_text}
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* IMPACT */}
      {(impact.heading || impact.description) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {impact.heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-[#555555] font-oswald-medium uppercase">
                {impact.heading}
              </h2>
            )}
            {impact.description && (
              <RichTextRenderer
                className="mt-3 text-xl text-gray-600 max-w-3xl mx-auto"
                html={impact.description}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
