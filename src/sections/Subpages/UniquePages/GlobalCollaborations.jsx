import React, { useState, useEffect } from "react";
import {
  Users,
  Award,
  FileText,
  MapPin,
  Trophy,
  Handshake,
} from "lucide-react";

import SafeImage from "../../../components/SafeImage";
import RichTextRenderer from "../../../components/RichTextRenderer";
import { renderIcon } from "../../../utils/renderIcon";

/**
 * GlobalCollaborations — section_id: "global_collaborations"
 *
 * Backend-driven version of the live-site "Collaborations & Partnerships"
 * subpage (live: pages/MicroPages/Global-Subpages/GlobalCollaborationsPartnerships.jsx).
 *
 * Reached from the Global Connect card grid →
 *   /global-connect/collaboration-partnerships
 *   → /api/micropage/global-connect/collaboration-partnerships
 *
 * Data shape (only the fields the CMS currently seeds):
 *   {
 *     header: { heading, description (HTML) },
 *     international_collaborations: {
 *       title, subtitle, icon,
 *       countries: [ { country_id, country_name, logos: [ { logo } ] } ]
 *     },
 *     qs_ranked: {
 *       title, icon,
 *       rank_cards: [ { rank_title, icon, universities: [ { name } ] } ]
 *     },
 *     recent_mous: { title, icon, mous: [ { title } ] }
 *   }
 */

const arr = (v) => (Array.isArray(v) ? v : []);

export default function GlobalCollaborations({ data = {} }) {
  const header = data.header || {};
  const intl = data.international_collaborations || {};
  const qs = data.qs_ranked || {};
  const mousSection = data.recent_mous || {};

  const countries = arr(intl.countries);
  const rankCards = arr(qs.rank_cards);
  const mous = arr(mousSection.mous);

  // Active country tab — default to the first country the CMS provides.
  const [activeId, setActiveId] = useState(
    countries[0]?.country_id || countries[0]?.country_name || ""
  );

  useEffect(() => {
    if (
      countries.length &&
      !countries.some(
        (c) => (c.country_id || c.country_name) === activeId
      )
    ) {
      setActiveId(countries[0].country_id || countries[0].country_name);
    }
  }, [countries, activeId]);

  const activeCountry =
    countries.find(
      (c) => (c.country_id || c.country_name) === activeId
    ) || countries[0];
  const activeLogos = arr(activeCountry?.logos);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="relative bg-white shadow-xl border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-[#91288D]/5 to-[#132F5C]/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <p className="text-3xl md:text-5xl font-bold text-[#132F5C]">
                {header.heading || "Global Collaborations & Partnerships"}
              </p>
            </div>
            {header.description && (
              <RichTextRenderer
                className="text-gray-600 max-w-5xl mx-auto leading-relaxed text-lg font-medium"
                html={header.description}
              />
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* International Collaborations */}
        {countries.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-[#91288D] to-[#132F5C] p-3 rounded-full shadow-lg mr-4">
                  {renderIcon(intl.icon, 32, "h-8 w-8 text-white") || (
                    <Users className="h-8 w-8 text-white" />
                  )}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-[#132F5C]">
                  {intl.title || "International Collaborations"}
                </h2>
              </div>
              {intl.subtitle && (
                <p className="text-gray-600 text-xl font-medium">
                  {intl.subtitle}
                </p>
              )}
            </div>

            {/* Country Tabs + logo grid */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-wrap justify-center p-2">
                  {countries.map((country) => {
                    const id = country.country_id || country.country_name;
                    const isActive = id === activeId;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveId(id)}
                        className={`px-8 py-4 m-1 font-bold text-sm transition-all duration-300 rounded-2xl transform hover:scale-105 ${
                          isActive
                            ? "bg-[#91288D] text-white shadow-lg scale-105"
                            : "text-gray-600 hover:bg-[#132F5C] hover:text-white hover:shadow-md"
                        }`}
                      >
                        <MapPin className="h-4 w-4 inline mr-2" />
                        {country.country_name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeLogos.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                    >
                      <SafeImage
                        src={item.logo}
                        alt={`${activeCountry?.country_name || "Institution"} ${
                          index + 1
                        }`}
                        className="h-20 w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* QS-Ranked Collaborations */}
        {rankCards.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-[#91288D] to-[#132F5C] p-3 rounded-full shadow-lg mr-4">
                  {renderIcon(qs.icon, 32, "h-8 w-8 text-white") || (
                    <Award className="h-8 w-8 text-white" />
                  )}
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#91288D] to-[#132F5C] bg-clip-text text-transparent">
                  {qs.title || "QS-Ranked Collaborations"}
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {rankCards.map((card, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 border border-gray-100"
                >
                  <div className="bg-[#132F5C] text-white p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6" />
                    <div className="relative">
                      {renderIcon(card.icon, 40, "h-10 w-10 mx-auto mb-3") || (
                        <Trophy className="h-10 w-10 mx-auto mb-3" />
                      )}
                      <h3 className="text-2xl font-bold">{card.rank_title}</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="space-y-4">
                      {arr(card.universities).map((uni, idx) => (
                        <div
                          key={idx}
                          className="flex items-start p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-[#91288D]/10 hover:to-[#132F5C]/10 transition-all duration-300 group-hover:shadow-md"
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-[#91288D] to-[#132F5C] rounded-full mt-1.5 mr-4 flex-shrink-0" />
                          <span className="text-gray-700 font-semibold">
                            {uni.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent MoUs */}
        {mous.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-[#91288D] to-[#132F5C] p-3 rounded-full shadow-lg mr-4">
                  {renderIcon(mousSection.icon, 32, "h-8 w-8 text-white") || (
                    <Handshake className="h-8 w-8 text-white" />
                  )}
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-[#91288D] to-[#132F5C] bg-clip-text text-transparent">
                  {mousSection.title || "Recent MoUs Signed"}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                {mous.map((mou, index) => (
                  <div
                    key={index}
                    className="group flex items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-[#91288D] hover:to-[#132F5C] transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                  >
                    <FileText className="h-6 w-6 text-[#91288D] group-hover:text-white mr-4 flex-shrink-0 transition-colors duration-300" />
                    <span className="text-gray-700 group-hover:text-white font-semibold transition-colors duration-300 flex-1">
                      {mou.title}
                    </span>
                    <div className="ml-4">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#91288D] to-[#132F5C] rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
