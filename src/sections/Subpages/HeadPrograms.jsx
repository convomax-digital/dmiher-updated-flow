import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Search, X, GraduationCap } from "lucide-react";
import { useMedicineProgramsData } from "../../hooks/useMedicineProgramsData";
import Seo from "../../components/Seo";
import { renderIcon } from "../../utils/renderIcon";
import { CardSkeletonGrid } from "../../components/Skeletons/CardSkeleton";

const Medicine = ({ slug: slugProp }) => {
  const { slug: slugParam } = useParams();
  // Backend slugs are lowercase & the lookup is case-sensitive; the URL param
  // can arrive in any case, so normalize (same as Programs/Departments).
  const slug = (slugParam || slugProp || "medicine").toLowerCase();

  const { institutes, settings, meta, name, loading, error } =
    useMedicineProgramsData(slug);

  const [activeInstIndex, setActiveInstIndex] = useState(0);
  const [activeSubTabIndex, setActiveSubTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setActiveInstIndex(0);
    setActiveSubTabIndex(0);
    setSearchQuery("");
  }, [slug]);

  useEffect(() => {
    setActiveSubTabIndex(0);
    setSearchQuery("");
  }, [activeInstIndex]);

  const currentInstitute = institutes[activeInstIndex];
  const subTabs = currentInstitute?.tabs || [];
  const currentSubTab = subTabs[activeSubTabIndex];

  const filteredPrograms = useMemo(() => {
    const programs = currentSubTab?.programs || [];
    if (!searchQuery) return programs;
    const q = searchQuery.toLowerCase();
    return programs.filter((p) => (p.title || "").toLowerCase().includes(q));
  }, [currentSubTab, searchQuery]);

  if (loading) {
    return (
      <section className="streams-wrapper">
        <div className="container py-8">
          <div
            className="skeleton"
            style={{ width: "40%", height: 32, marginBottom: 24 }}
          />
          <CardSkeletonGrid count={6} />
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="sub-error">{error}</div>;
  }

  if (!institutes.length) {
    return (
      <div className="sub-empty">
        <GraduationCap size={60} className="sub-empty-icon" />
        <h3 className="sub-empty-title">
          No Programs Available
        </h3>
      </div>
    );
  }

  return (
    <section className="streams-wrapper">
      {/* Dashboard-managed SEO for this program page (Programs CRUD). */}
      <Seo meta={meta} fallbackTitle={name} />
      <div className="container py-8">
        {/* ================= MAIN TABS ================= */}
        {institutes.length > 0 && (
          <div className="subprog-tabs-wrap">
            <ul
              id="main-tabs"
              className="medicine-tabs main-tabs"
              role="tablist"
              aria-label="College tabs"
            >
              {institutes.map((inst, index) => {
                const isActive = activeInstIndex === index;
                return (
                  <li
                    key={inst.page_slug}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    data-slug={inst.page_slug}
                    onClick={() => setActiveInstIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveInstIndex(index);
                      }
                    }}
                    className={`medicine-tab ${
                      isActive ? "medicine-tab-active" : "medicine-tab-inactive"
                    }`}
                  >
                    {inst.page_slug}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ================= SEARCH ================= */}
        <div className="subprog-search-wrap">
          <div className="subprog-search-inner">
            <Search size={20} className="subprog-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={settings.search_placeholder || "Search programs..."}
              className="subprog-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="subprog-search-clear"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* ================= SUB-TABS ================= */}
        {subTabs.length > 1 && (
          <div className="subprog-tabs-wrap">
            <div className="subprog-tabs-card">
              <div
                className="subprog-tabs-grid"
                style={{
                  gridTemplateColumns: `repeat(${subTabs.length}, minmax(0, 1fr))`,
                }}
              >
                <div
                  className="subprog-tabs-indicator subprog-tabs-indicator-orange"
                  style={{
                    left: `calc(${activeSubTabIndex * (100 / subTabs.length)}%)`,
                    width: `${100 / subTabs.length}%`,
                  }}
                />
                {subTabs.map((tab, index) => {
                  const isActive = activeSubTabIndex === index;
                  return (
                    <button
                      key={tab.tab_id}
                      onClick={() => setActiveSubTabIndex(index)}
                      className={`subprog-subtab ${
                        isActive
                          ? "subprog-subtab-active"
                          : "subprog-subtab-inactive"
                      }`}
                    >
                      {renderIcon(
                        tab.icon,
                        18,
                        "sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0"
                      )}
                      <span className="subprog-subtab-label">
                        {tab.tab_label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= PROGRAMS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPrograms.map((program, index) => (
            <div
              key={`${program.title}-${index}`}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-full flex flex-col">
                {/* Title & Duration */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight flex-1">
                      {program.title}
                    </h3>
                    <span className="text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {program.duration || "N/A"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-[Arial]">
                    {program.description || "Program details not available."}
                  </p>
                </div>

                {/* College Name */}
                <div className="flex-1 mb-1 sm:mb-2">
                  <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm font-medium text-blue-800 leading-snug">
                      {program.college_name}
                    </p>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="mb-4 sm:mb-5">
                  <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Eligibility
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-snug font-[Arial]">
                      {program.eligibility ||
                        "Contact the college for eligibility details."}
                    </p>
                  </div>
                </div>

                {/* Apply Now Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-[#F04E30] text-white font-medium py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg hover:bg-[#122E5E] transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    {settings.apply_label || "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= EMPTY STATE ================= */}
        {filteredPrograms.length === 0 && (
          <div className="subprog-empty">
            <GraduationCap
              size={60}
              className="sub-empty-icon"
            />
            <h3 className="sub-empty-title">
              No Programs Found
            </h3>
            {searchQuery && (
              <p className="subprog-empty-hint">Try a different search term</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Medicine;
