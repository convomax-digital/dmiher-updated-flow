import React, { useState, useMemo } from "react";
import {
  Users,
  Globe,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  Building,
  ChevronDown,
  Star,
  BookOpen,
  GraduationCap,
  Briefcase,
  Trophy,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import SafeImage from "../../components/SafeImage";
import { useMicropageData } from "../../hooks/useMicropageData";

/**
 * HigherEducationPlacement — backend-driven render of the SRMMCON
 * "Higher Education & Placement" CTA (section_key `higher_education_placement_subpage`).
 *
 * Mirrors the live-site static page (hero stats → country distribution →
 * country-filtered, click-to-expand student cards → recruiter logos +
 * achievement banner). All content comes from the micro-page data:
 *   { hero:{heading,subtitle}, stats:[{icon,value,label}],
 *     country_distribution:{heading, location_distribution:[{icon,value,id}]},
 *     students_header:{heading,subtitle},
 *     students:[{name,batch,program,institution,country_id}],
 *     recruiters_header:{heading,subtitle}, recruiters:[{image}],
 *     achievement:{icon, subtitle(html)} }
 */

const ICON_MAP = {
  users: Users,
  globe: Globe,
  award: Award,
  "trending-up": TrendingUp,
  trophy: Trophy,
  "map-pin": MapPin,
  calendar: Calendar,
  building: Building,
  star: Star,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
};
const resolveIcon = (name) => ICON_MAP[name] || Award;

// Deterministic badge colour per country so the globe chips stay varied for
// any admin-defined location set (no hard-coded country names).
const BADGE_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-orange-100 text-orange-600",
  "bg-red-100 text-red-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-teal-100 text-teal-600",
];
const colorFor = (key) => {
  const s = String(key || "");
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return BADGE_COLORS[sum % BADGE_COLORS.length];
};

const studentKey = (s, i) => `${s.name || ""}-${s.batch || ""}-${i}`;

function HigherEducationPlacement({ data: propData, college, pageSlug: propPageSlug }) {
  const params = useParams();
  const location = useLocation();
  const seg = location.pathname.split("/").filter(Boolean);

  const pageSlug = params.college || college || propPageSlug || seg[0];
  const ctaKey = params.page || seg[1];

  const { sections, loading, error } = useMicropageData(pageSlug, ctaKey, propData);

  const data = useMemo(() => {
    if (propData) return propData;
    return (
      sections?.find((s) => s.section_id === "higher_education_placement_subpage")
        ?.data ||
      sections?.[0]?.data ||
      {}
    );
  }, [propData, sections]);

  const {
    hero = {},
    stats = [],
    country_distribution = {},
    students_header = {},
    students = [],
    recruiters_header = {},
    recruiters = [],
    achievement = {},
  } = data;

  const locations = Array.isArray(country_distribution.location_distribution)
    ? country_distribution.location_distribution
    : [];

  const [selectedCountry, setSelectedCountry] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);

  const filteredStudents =
    selectedCountry === "all"
      ? students
      : students.filter((s) => s.country_id === selectedCountry);

  if (loading) {
    return (
      <div className="sub-loading-wrap">
        <div className="sub-loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="sub-error">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ============ HERO STATS ============ */}
      <section className="py-16 bg-[#132F5C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {hero.heading && (
              <h2 className="text-4xl font-bold text-white mb-4">
                {hero.heading}
              </h2>
            )}
            {hero.subtitle && (
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                {hero.subtitle}
              </p>
            )}
          </div>

          {stats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8">
              {stats.map((stat, i) => {
                const Icon = resolveIcon(stat.icon);
                return (
                  <div
                    key={i}
                    className="w-full sm:w-64 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
                  >
                    <Icon className="h-12 w-12 text-white mx-auto mb-4" />
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============ COUNTRY DISTRIBUTION ============ */}
      {locations.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {country_distribution.heading && (
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                {country_distribution.heading}
              </h3>
            )}
            <div className="flex flex-wrap justify-center gap-6">
              {locations.map((loc, i) => {
                const Icon = resolveIcon(loc.icon);
                return (
                  <div
                    key={i}
                    className="w-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100 hover:shadow-lg transition-all duration-300"
                  >
                    <Icon className="h-8 w-8 text-[#132F5C] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-[#132F5C] mb-1">
                      {loc.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {loc.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ FILTER + STUDENT CARDS ============ */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {students_header.heading && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {students_header.heading}
              </h2>
            )}
            {students_header.subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {students_header.subtitle}
              </p>
            )}
          </div>

          {/* Country filter */}
          {locations.length > 0 && (
            <div className="mb-10 flex justify-center">
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setExpandedCard(null);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-6 py-3 pr-10 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
                >
                  <option value="all">All Countries</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.id}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Student cards */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map((student, i) => {
                const key = studentKey(student, i);
                const expanded = expandedCard === key;
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      expanded ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setExpandedCard(expanded ? null : key)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {student.name}
                          </h3>
                          {student.batch && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              {student.batch}
                            </div>
                          )}
                        </div>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorFor(
                            student.country_id
                          )}`}
                        >
                          <Globe className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {student.program && (
                          <div className="flex items-start">
                            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Program
                              </div>
                              <div
                                className={`text-sm text-gray-600 ${
                                  expanded ? "" : "line-clamp-2"
                                }`}
                              >
                                {student.program}
                              </div>
                            </div>
                          </div>
                        )}

                        {student.institution && (
                          <div className="flex items-center">
                            <Building className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Institution
                              </div>
                              <div className="text-sm text-gray-600">
                                {student.institution}
                              </div>
                            </div>
                          </div>
                        )}

                        {student.country_id && (
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Location
                              </div>
                              <div className="text-sm text-gray-600 font-medium">
                                {student.country_id}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-center text-sm text-blue-700 font-medium">
                        <Star className="h-4 w-4 mr-1" />
                        Success Story
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No records found.</p>
          )}
        </div>
      </section>

      {/* ============ RECRUITERS + ACHIEVEMENT ============ */}
      {(recruiters.length > 0 || achievement.subtitle) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(recruiters_header.heading || recruiters_header.subtitle) && (
              <div className="text-center mb-12">
                {recruiters_header.heading && (
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {recruiters_header.heading}
                  </h2>
                )}
                {recruiters_header.subtitle && (
                  <p className="text-lg text-gray-600">
                    {recruiters_header.subtitle}
                  </p>
                )}
              </div>
            )}

            {recruiters.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8">
                {recruiters.map((recruiter, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-40 h-40 rounded-full flex items-center justify-center mx-auto overflow-hidden bg-white border border-gray-200">
                      <SafeImage
                        src={recruiter.image}
                        alt="Recruitment partner"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {achievement.subtitle && (
              <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center border border-green-200">
                {(() => {
                  const Icon = resolveIcon(achievement.icon);
                  return <Icon className="h-16 w-16 text-green-600 mx-auto mb-4" />;
                })()}
                <div
                  className="hep-achievement-body"
                  dangerouslySetInnerHTML={{ __html: achievement.subtitle }}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default HigherEducationPlacement;
