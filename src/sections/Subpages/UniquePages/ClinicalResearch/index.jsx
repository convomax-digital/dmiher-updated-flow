import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import {
  Microscope, Users, Award, Target, Heart, Phone, Mail, MapPin,
  ChevronDown, ChevronUp, Star, Building, UserCheck, FileText,
  Stethoscope, Globe, TrendingUp, Shield, Database, Clock, CheckCircle,
} from "lucide-react";

import SafeImage from "../../../../components/SafeImage";
import { renderIcon } from "../../../../utils/renderIcon";
import resolveImage from "../../../../utils/resolveImage";

// ---------- helpers ----------
const arr = (v) => (Array.isArray(v) ? v : []);
const get = (obj, key, fallback = "") => (obj && obj[key] != null ? obj[key] : fallback);

const ContactCard = ({ icon, name, link }) => {
  const href = link ? resolveImage(link) : "#";
  const iconNode = renderIcon(icon, 24, "w-6 h-6") || <FileText className="w-6 h-6" />;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:bg-[#FAF1F9]">
        <div className="bg-[#91288D]/10 text-[#91288D] rounded-full p-3">{iconNode}</div>
        <div className="text-gray-800 font-medium text-[20px] mt-2 leading-snug">{name}</div>
      </div>
    </a>
  );
};

export default function ClinicalResearch({ data = {} }) {
  // states
  const [activeOverviewTab, setActiveOverviewTab] = useState("overview");
  const [activeTestimonialTab, setActiveTestimonialTab] = useState("pi");
  const [expandedTestimonial, setExpandedTestimonial] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const collabTabs = arr(data.collaboration_tabs);
  const [activePartnersTab, setActivePartnersTab] = useState(collabTabs[0]?.tab_name || "");
  const [activeIECTab, setActiveIECTab] = useState("wardha");
  const locations = arr(data.locations);
  const [activeLoc, setActiveLoc] = useState(locations[0]?.label || "");

  // pull groups
  const hero            = data.hero || {};
  const heroStats       = arr(data.hero_stats);
  const overviewHeader  = data.overview_header || {};
  const overviewContent = data.overview_content || {};
  const overviewCards   = arr(data.overview_cards);
  const coreFunctions   = arr(data.core_functions);
  const areasExpertise  = arr(data.areas_of_expertise);
  const therapeuticHd   = data.therapeutic_header || {};
  const therapeuticArea = arr(data.therapeutic_areas);
  const expertiseHeader = data.expertise_header || {};
  const expertiseItems  = arr(data.expertise_items);
  const diffHeader      = data.differentiators_header || {};
  const differentiators = arr(data.differentiators);
  const vision          = data.vision || {};
  const mission         = data.mission || {};
  const missionPoints   = arr(data.mission_points);
  const capHeader       = data.capabilities_header || {};
  const capabilities    = arr(data.capabilities);
  const strengthHeader  = data.strength_header || {};
  const strengthCards   = arr(data.strength_cards);
  const certsHeader     = data.certificates_header || {};
  const certificates    = arr(data.certificates);
  const testHeader      = data.testimonials_header || {};
  const piTestimonials  = arr(data.pi_testimonials);
  const successStories  = arr(data.success_stories);
  const facilitiesHd    = data.facilities_header || {};
  const facilities      = arr(data.facilities);
  const collabHeader    = data.collaborations_header || {};
  const ethicsHeader    = data.ethics_header || {};
  const ethicsCommittee = data.ethics_committee || {};
  const organogram      = data.organogram || {};
  const wardhaContacts  = arr(data.wardha_contacts);
  const nagpurContacts  = arr(data.nagpur_contacts);
  const contactPerson   = data.contact_person || {};
  const contactAddress  = data.contact_address || {};
  const gcpNote         = data.gcp_note || {};

  const activeTabLogos = collabTabs.find((t) => t.tab_name === activePartnersTab)?.logos || [];
  const currentLocation = locations.find((l) => l.label === activeLoc) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#132F5C] to-[#1a3b8a] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {get(hero, "heading")}{" "}
              <span className="text-[#91288D]">{get(hero, "highlighted_text")}</span>
            </h1>
            {get(hero, "description") && (
              <p className="text-xl leading-relaxed opacity-90">{hero.description}</p>
            )}

            {heroStats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {heroStats.slice(0, 3).map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
                    <div className="text-3xl font-bold text-[#91288D]">{s.value}</div>
                    <div className="text-sm opacity-90">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            {heroStats.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {heroStats.slice(3).map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
                    <div className="text-3xl font-bold text-[#91288D]">{s.value}</div>
                    <div className="text-sm opacity-90">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(overviewHeader, "heading", "Clinical Trial Centre Overview")}</h2>
            {get(overviewHeader, "subtitle") && (
              <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{overviewHeader.subtitle}</p>
            )}
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1">
              {[
                ["overview",  get(overviewHeader, "tab_label_overview",  "Overview")],
                ["functions", get(overviewHeader, "tab_label_functions", "Core Functions")],
                ["expertise", get(overviewHeader, "tab_label_expertise", "Areas of Expertise")],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveOverviewTab(key)}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    activeOverviewTab === key ? "bg-[#132F5C] text-white" : "text-gray-600 hover:text-[#132F5C]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeOverviewTab === "overview" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-[#132F5C]/10 to-[#91288D]/10 rounded-xl p-8 shadow-lg">
                {[overviewContent.paragraph_1, overviewContent.paragraph_2, overviewContent.paragraph_3]
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed text-lg mb-6 last:mb-0">{p}</p>
                  ))}

                {overviewCards.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {overviewCards.map((c, i) => (
                      <div key={i} className="bg-white rounded-lg p-6 text-center shadow-sm">
                        <div className="text-[#91288D] mx-auto mb-4 flex items-center justify-center">
                          {renderIcon(c.icon, 48) || <Shield className="h-12 w-12" />}
                        </div>
                        <h4 className="font-bold text-[#132F5C] mb-2">{c.title}</h4>
                        <p className="text-gray-600 text-sm">{c.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeOverviewTab === "functions" && coreFunctions.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coreFunctions.map((f, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-[#91288D]">
                    <h3 className="text-xl font-bold text-[#132F5C] mb-3">{f.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeOverviewTab === "expertise" && areasExpertise.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areasExpertise.map((a, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-[#132F5C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Microscope className="h-8 w-8 text-[#91288D]" />
                    </div>
                    <h3 className="font-bold text-[#132F5C] mb-2">{a.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Therapeutic Areas */}
      {therapeuticArea.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(therapeuticHd, "heading", "Our Therapeutic Areas")}</h2>
              {get(therapeuticHd, "subtitle") && (
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{therapeuticHd.subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapeuticArea.map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-all hover:bg-[#132F5C]/5 group">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-6 w-6 text-[#91288D] group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-[#132F5C]">{a.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Expertise Covers */}
      {expertiseItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(expertiseHeader, "heading", "Our Expertise Covers")}</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expertiseItems.map((it, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle className="h-6 w-6 text-[#91288D] mt-1 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{it.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Differentiators */}
      {differentiators.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(diffHeader, "heading", "What Sets Us Apart")}</h2>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {differentiators.map((d, i) => (
                <div key={i} className="flex items-start space-x-4 p-6 bg-gradient-to-r from-[#132F5C]/5 to-[#91288D]/10 rounded-lg">
                  <Award className="h-6 w-6 text-[#91288D] mt-1 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(get(vision, "description") || missionPoints.length > 0) && (
        <section className="py-16 bg-[#132F5C] text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="h-8 w-8 text-[#91288D]" />
                  <h2 className="text-3xl font-bold">{get(vision, "heading", "Our Vision")}</h2>
                </div>
                <p className="text-lg leading-relaxed opacity-90">{get(vision, "description")}</p>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="h-8 w-8 text-[#91288D]" />
                  <h2 className="text-3xl font-bold">{get(mission, "heading", "Our Mission")}</h2>
                </div>
                <ul className="space-y-4">
                  {missionPoints.map((p, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-[#91288D] rounded-full mt-3 flex-shrink-0" />
                      <p className="opacity-90 leading-relaxed">{p.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Capabilities + Strength */}
      {(capabilities.length > 0 || strengthCards.length > 0) && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(capHeader, "heading", "Our Capacity & Capabilities")}</h2>
              {get(capHeader, "subtitle") && (
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{capHeader.subtitle}</p>
              )}
            </div>

            {capabilities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {capabilities.map((c, i) => (
                  <div key={i} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-[#132F5C] mb-4">{c.title}</h3>
                    <ul className="space-y-3">
                      {arr(c.items).map((it, j) => (
                        <li key={j} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-[#91288D] mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 leading-relaxed">{it.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {strengthCards.length > 0 && (
              <div className="mt-16">
                <h3 className="text-3xl font-bold text-[#132F5C] mb-8 text-center">{get(strengthHeader, "heading", "Our Strength")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {strengthCards.map((s, i) => (
                    <div key={i} className="bg-white rounded-lg p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                      <div className="text-[#91288D] mx-auto mb-4 flex justify-center">
                        {renderIcon(s.icon, 48) || <Building className="h-12 w-12" />}
                      </div>
                      <h4 className="text-xl font-bold text-[#132F5C] mb-4">{s.title}</h4>
                      <p className="text-gray-700 leading-relaxed mb-4">{s.description}</p>

                      {s.read_more && (
                        <>
                          {!showMore ? (
                            <button onClick={() => setShowMore(true)} className="text-[#132F5C] font-medium underline">Read more</button>
                          ) : (
                            <div className="mt-2 text-left whitespace-pre-line">
                              <p className="text-gray-700">{s.read_more}</p>
                              <button onClick={() => setShowMore(false)} className="text-[#91288D] font-medium underline-offset-4 hover:underline mt-2">View less</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* GCP Certificates */}
      {certificates.length > 0 && (
        <section className="py-16 bg-[#F8FAFC] text-[#1F2937]">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-[#132F5C] mb-8 text-center">{get(certsHeader, "heading", "PIs GCP Certificates")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {certificates.map((c, i) => (
                <ContactCard key={i} icon={c.icon || "file-text"} name={c.name} link={c.pdf || c.link} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {(piTestimonials.length > 0 || successStories.length > 0) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(testHeader, "heading", "What Our Team Says")}</h2>
              {get(testHeader, "subtitle") && (
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{testHeader.subtitle}</p>
              )}
            </div>
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1">
                <button onClick={() => setActiveTestimonialTab("pi")} className={`px-6 py-3 rounded-md font-medium transition-all ${activeTestimonialTab === "pi" ? "bg-[#132F5C] text-white" : "text-gray-600 hover:text-[#132F5C]"}`}>
                  {get(testHeader, "tab_label_pi", "Principal Investigators")}
                </button>
                <button onClick={() => setActiveTestimonialTab("patient")} className={`px-6 py-3 rounded-md font-medium transition-all ${activeTestimonialTab === "patient" ? "bg-[#132F5C] text-white" : "text-gray-600 hover:text-[#132F5C]"}`}>
                  {get(testHeader, "tab_label_patient", "Success Stories")}
                </button>
              </div>
            </div>

            {activeTestimonialTab === "pi" && piTestimonials.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {piTestimonials.map((t, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-[#91288D]">
                    <div className="flex items-center space-x-3 mb-4">
                      <UserCheck className="h-6 w-6 text-[#132F5C]" />
                      <div>
                        <h4 className="font-bold text-[#132F5C]">{t.name}</h4>
                        <p className="text-sm text-gray-600">{t.role}</p>
                        {t.department && (
                          <span className="inline-block bg-[#91288D]/20 text-[#132F5C] text-xs px-2 py-1 rounded-full mt-1">{t.department}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {expandedTestimonial === i ? t.content : `${(t.content || "").substring(0, 120)}...`}
                    </p>
                    <button
                      onClick={() => setExpandedTestimonial(expandedTestimonial === i ? null : i)}
                      className="text-[#91288D] text-sm font-medium mt-2 hover:underline flex items-center space-x-1"
                    >
                      <span>{expandedTestimonial === i ? "Read Less" : "Read More"}</span>
                      {expandedTestimonial === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTestimonialTab === "patient" && (
              <div className="max-w-4xl mx-auto">
                <Swiper
                  style={{ paddingBottom: 60 }}
                  slidesPerView={"auto"}
                  centeredSlides
                  spaceBetween={30}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                >
                  {successStories.length > 0 ? (
                    successStories.map((s, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="bg-gradient-to-r from-[#132F5C]/10 to-[#91288D]/10 rounded-xl p-8 shadow-lg">
                          <div className="flex items-center space-x-3 mb-6">
                            <Star className="h-8 w-8 text-[#91288D]" />
                            <div>
                              <h3 className="text-2xl font-bold text-[#132F5C]">{s.name}</h3>
                              <p className="text-[#91288D] font-medium">{s.professor}</p>
                            </div>
                          </div>
                          {s.value && (
                            <div className="rounded-lg p-3 mb-3">
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="bg-[#91288D] text-[#132F5C] font-bold text-2xl w-16 h-16 rounded-full flex items-center justify-center">
                                  {s.value}
                                </div>
                                <div>
                                  <p className="font-bold text-[#132F5C]">{s.treatment}</p>
                                  <p className="text-gray-600">{s.clinical}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <blockquote className="text-gray-700 leading-relaxed text-lg italic mb-6">{s.text}</blockquote>
                        </div>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <div className="text-[#555555] text-center py-16">No testimonials available yet.</div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Facilities */}
      {facilities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(facilitiesHd, "heading", "Facilities & Infrastructure")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {facilities.map((f, i) => (
                <div key={i} className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-[#91288D] mx-auto mb-4 flex justify-center">
                    {renderIcon(f.icon, 48) || <Building className="h-12 w-12" />}
                  </div>
                  <h4 className="font-bold text-[#132F5C] mb-2">{f.title}</h4>
                  <p className="text-gray-600 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collaborations */}
      {collabTabs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] mb-4">{get(collabHeader, "heading", "Collaborations & Partnerships")}</h2>
              {get(collabHeader, "subtitle") && (
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{collabHeader.subtitle}</p>
              )}
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
                    {collabTabs.map((t) => (
                      <button
                        key={t.tab_name}
                        onClick={() => setActivePartnersTab(t.tab_name)}
                        className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 text-center ${
                          activePartnersTab === t.tab_name
                            ? "bg-[#91288D] text-white min-h-[50px] sm:min-h-[60px] lg:min-h-[70px] shadow-md"
                            : "text-gray-700 hover:bg-[#132F5C] hover:text-white hover:shadow-md"
                        }`}
                      >
                        <MapPin className="h-4 w-4 inline-block" />
                        <span className="text-sm sm:text-base lg:text-lg">{t.tab_name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 md:p-10">
                  {activeTabLogos.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeTabLogos.map((item, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl cursor-pointer"
                          title={item.name}
                        >
                          <SafeImage src={item.image} alt={item.name} className="h-20 w-full object-contain" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No items yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ethics Committee */}
      {(ethicsCommittee.wardha_image || ethicsCommittee.nagpur_image) && (
        <section className="bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C] pt-5 mb-4">{get(ethicsHeader, "heading", "Institutional Ethics Committee")}</h2>
              {get(ethicsHeader, "subtitle") && (
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{ethicsHeader.subtitle}</p>
              )}
            </div>
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1">
                <button onClick={() => setActiveIECTab("wardha")} className={`px-6 py-3 rounded-md font-medium mx-2 transition-all ${activeIECTab === "wardha" ? "bg-[#132F5C] text-white" : "text-gray-600 hover:text-[#132F5C]"}`}>
                  {get(ethicsHeader, "tab_label_wardha", "Wardha")}
                </button>
                <button onClick={() => setActiveIECTab("nagpur")} className={`px-6 py-3 rounded-md font-medium mx-2 transition-all ${activeIECTab === "nagpur" ? "bg-[#132F5C] text-white" : "text-gray-600 hover:text-[#132F5C]"}`}>
                  {get(ethicsHeader, "tab_label_nagpur", "Nagpur")}
                </button>
              </div>
            </div>
            <SafeImage
              src={activeIECTab === "wardha" ? ethicsCommittee.wardha_image : ethicsCommittee.nagpur_image}
              alt={`IEC ${activeIECTab}`}
              className="mx-auto max-w-full"
            />
          </div>
        </section>
      )}

      {/* Organogram */}
      {(organogram.heading || organogram.image) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#132F5C]">{get(organogram, "heading")}</h2>
            </div>
            {organogram.image && <SafeImage src={organogram.image} alt="Organogram" className="mx-auto max-w-full" />}
          </div>
        </section>
      )}

      {/* Contacts / IEC PDFs + Contact Us */}
      <section className="py-16 bg-[#F8FAFC] text-[#1F2937]">
        <div className="container mx-auto px-4">
          {((activeIECTab === "wardha" && wardhaContacts.length > 0) ||
            (activeIECTab === "nagpur" && nagpurContacts.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {(activeIECTab === "wardha" ? wardhaContacts : nagpurContacts).map((c, i) => (
                <ContactCard key={i} icon={c.icon} name={c.name} link={c.link} />
              ))}
            </div>
          )}

          <div className="container text-center space-y-6 mt-5">
            {(get(contactPerson, "heading") || get(contactPerson, "subheading")) && (
              <h2 className="text-3xl font-bold text-[#132F5C]">
                {get(contactPerson, "heading", "Contact Us")}
                {get(contactPerson, "subheading") && (
                  <p className="text-xl font-[400] text-[#132F5C]">{contactPerson.subheading}</p>
                )}
              </h2>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-6">
              {get(contactPerson, "name") && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex-1 max-w-md">
                  <div className="flex flex-col items-center space-y-2 mb-4">
                    <UserCheck className="h-6 w-6 text-[#132F5C]" />
                    <h3 className="text-xl font-medium text-[#132F5C]">{contactPerson.name}</h3>
                  </div>
                  {contactPerson.designation && (
                    <p className="text-base font-light mb-4 text-gray-700">{contactPerson.designation}</p>
                  )}
                  <div className="space-y-3">
                    {contactPerson.email && (
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4 text-[#91288D]" />
                        <a href={`mailto:${contactPerson.email}`} className="text-[#132F5C] hover:underline">{contactPerson.email}</a>
                      </div>
                    )}
                    {contactPerson.phone && (
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4 text-[#91288D]" />
                        <a href={`tel:${contactPerson.phone}`} className="text-[#132F5C] hover:underline">{contactPerson.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {get(contactAddress, "address") && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex-1 max-w-md">
                  <h3 className="text-lg font-medium mb-3 flex items-center justify-center space-x-2 text-[#132F5C]">
                    <Building className="h-5 w-5 text-[#91288D]" />
                    <span>{get(contactAddress, "heading", "Clinical Trial Centre Address")}</span>
                  </h3>
                  <p className="text-sm font-light text-gray-700 leading-relaxed whitespace-pre-line">{contactAddress.address}</p>
                </div>
              )}

              {get(gcpNote, "description") && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex-1 max-w-md">
                  <h3 className="text-lg font-medium mb-3 flex items-center justify-center space-x-2 text-[#132F5C]">
                    <FileText className="h-5 w-5 text-[#91288D]" />
                    <span>{get(gcpNote, "heading", "ICH GCP Certificates")}</span>
                  </h3>
                  <p className="text-sm font-light text-gray-700">{gcpNote.description}</p>
                </div>
              )}
            </div>

            {locations.length > 0 && (
              <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <h3 className="text-lg font-medium mb-4 flex items-center justify-center space-x-2 text-[#132F5C]">
                  <MapPin className="h-5 w-5 text-[#91288D]" />
                  <span>Clinical Trial Center Address</span>
                </h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {locations.map((l) => (
                    <button
                      key={l.label}
                      onClick={() => setActiveLoc(l.label)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                        activeLoc === l.label
                          ? "bg-[#91288D] text-white border-[#91288D]"
                          : "bg-white text-[#132F5C] border-gray-300 hover:bg-[#132F5C] hover:text-white"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm font-light text-gray-700 leading-relaxed">{currentLocation.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
