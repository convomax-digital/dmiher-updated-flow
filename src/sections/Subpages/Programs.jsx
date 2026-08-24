import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search, X, GraduationCap } from "lucide-react";
import { useProgramsData } from "../../hooks/useProgramsData";
import { renderIcon } from "../../utils/renderIcon";
import { CardSkeletonGrid } from "../../components/Skeletons/CardSkeleton";

/* True only when a field actually carries data. Handles the shapes a program
   field can take: string, array (bullet list), or object (grouped eligibility).
   Used to hide fields entirely when the backend has nothing for them, rather
   than rendering placeholder text. */
const hasContent = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
};

/* Eligibility may arrive as a string, a flat array of bullet points, or a
   { national, international } object (e.g. SRMMCON B.Sc. Nursing). Render
   each shape without dumping the raw object into JSX. */
const renderEligibility = (elig) => {
  if (!elig) {
    return <p className="subprog-card-elig-text">Contact the college for eligibility details.</p>;
  }
  if (typeof elig === "string") {
    return <p className="subprog-card-elig-text">{elig}</p>;
  }
  if (Array.isArray(elig)) {
    return (
      <ul className="subprog-card-elig-list">
        {elig.map((line, i) => <li key={i}>{line}</li>)}
      </ul>
    );
  }
  if (typeof elig === "object") {
    return (
      <div className="subprog-card-elig-grouped">
        {Object.entries(elig).map(([group, lines]) => (
          <div key={group} className="subprog-card-elig-group">
            <p className="subprog-card-elig-group-label">{group}</p>
            {Array.isArray(lines) ? (
              <ul className="subprog-card-elig-list">
                {lines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            ) : (
              <p className="subprog-card-elig-text">{String(lines)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  return <p className="subprog-card-elig-text">{String(elig)}</p>;
};

const SubPrograms = () => {
  const { college, category, slug } = useParams();
  const resolvedSlug = college || slug;

  // ?f=<faculty> — when the SAS "OUR PROGRAMS" buttons carry a faculty, show
  // only that faculty (like the live faculty-specific pages). The single
  // remaining institute makes the faculty tab row auto-hide (length > 1 gate).
  const [searchParams] = useSearchParams();
  const facultyParam = searchParams.get("f");

  const {
    institutes: allInstitutes,
    programs,
    settings,
    loading,
    error,
  } = useProgramsData(resolvedSlug);

  const institutes = useMemo(() => {
    if (facultyParam) {
      const only = allInstitutes.filter((i) => i.institute_id === facultyParam);
      if (only.length) return only;
    }
    return allInstitutes;
  }, [allInstitutes, facultyParam]);

  const [activeInstitute, setActiveInstitute] = useState("");
  const [activeInstIndex, setActiveInstIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState("");
  const [activeSubTabIndex, setActiveSubTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (institutes.length > 0 && !activeInstitute) {
      setActiveInstitute(institutes[0].institute_id);
      setActiveInstIndex(0);
    }
  }, [institutes]);

  const currentInstitute = institutes.find(
    (inst) => inst.institute_id === activeInstitute
  );
  const subTabs = currentInstitute?.tabs || [];

  useEffect(() => {
    if (subTabs.length === 0) return;

    if (category) {
      const matchIndex = subTabs.findIndex((tab) =>
        programs.some(
          (p) =>
            p.tab_id === tab.tab_id &&
            p.institute_slug === activeInstitute &&
            p.category === category
        )
      );

      if (matchIndex !== -1) {
        setActiveSubTab(subTabs[matchIndex].tab_id);
        setActiveSubTabIndex(matchIndex);
        return;
      }
    }

    setActiveSubTab(subTabs[0].tab_id);
    setActiveSubTabIndex(0);
  }, [activeInstitute, subTabs.length, category]);

  const handleInstituteChange = (instSlug, index) => {
    setActiveInstitute(instSlug);
    setActiveInstIndex(index);
  };

  const handleSubTabChange = (tabId, index) => {
    setActiveSubTab(tabId);
    setActiveSubTabIndex(index);
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (p.institute_slug !== activeInstitute) return false;
      if (p.tab_id !== activeSubTab) return false;
      if (searchQuery) {
        return (p.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [programs, activeInstitute, activeSubTab, searchQuery]);

  if (loading) {
    return (
      <section className="streams-wrapper">
        <div className="container py-8">
          <div className="skeleton" style={{ width: "40%", height: 32, marginBottom: 24 }} />
          <CardSkeletonGrid count={6} />
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="sub-error">{error}</div>;
  }

  if (!institutes.length && !programs.length) {
    return (
      <div className="sub-empty">
        <GraduationCap size={60} className="sub-empty-icon" />
        <h3 className="sub-empty-title">No Programs Available</h3>
      </div>
    );
  }

  return (
    <section className="streams-wrapper">
      <div className="container py-8">

        {/* ================= INSTITUTE TABS ================= */}
        {institutes.length > 1 && (
          <div className="subprog-tabs-wrap">
            <div className="subprog-tabs-card">
              <div
                className="subprog-tabs-grid"
                style={{
                  gridTemplateColumns: `repeat(${institutes.length}, minmax(0, 1fr))`,
                }}
              >
                <div
                  className="subprog-tabs-indicator subprog-tabs-indicator-blue"
                  style={{
                    left: `calc(${activeInstIndex * (100 / institutes.length)}%)`,
                    width: `${100 / institutes.length}%`,
                  }}
                />

                {institutes.map((inst, index) => {
                  const isActive = activeInstitute === inst.institute_id;
                  return (
                    <button
                      key={inst.institute_id}
                      onClick={() => handleInstituteChange(inst.institute_id, index)}
                      className={`subprog-inst-tab ${
                        isActive
                          ? "subprog-inst-tab-active"
                          : "subprog-inst-tab-inactive"
                      }`}
                    >
                      {inst.institute_label || inst.page_slug}
                    </button>
                  );
                })}
              </div>
            </div>
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
              <button onClick={() => setSearchQuery("")} className="subprog-search-clear">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* ================= SUB-TABS ================= */}
        {subTabs.length > 1 && (
          <div className="subprog-tabs-wrap">
            <div className="subprog-tabs-card">
              <div className="subprog-subtab-mobile-wrap">
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
                    const isActive = activeSubTab === tab.tab_id;
                    return (
                      <button
                        key={tab.tab_id}
                        onClick={() => handleSubTabChange(tab.tab_id, index)}
                        className={`subprog-subtab ${
                          isActive
                            ? "subprog-subtab-active"
                            : "subprog-subtab-inactive"
                        }`}
                      >
                        {renderIcon(tab.icon, 18, "sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0")}
                        <span className="subprog-subtab-label">
                          {tab.tab_label}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    <h3 className="font-sans text-base sm:text-lg lg:text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight flex-1">
                      {program.title}
                    </h3>
                    {program.duration && (
                      <span className="text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {program.duration}
                      </span>
                    )}
                  </div>
                  {program.description && (
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-[Arial]">
                      {program.description}
                    </p>
                  )}
                </div>

                {/* College Name */}
                <div className="flex-1 mb-1 sm:mb-2">
                  <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm font-medium text-blue-800 leading-snug">
                      {program.college_name}
                    </p>
                  </div>
                </div>

                {/* Eligibility — hidden entirely when the backend has none */}
                {hasContent(program.eligibility) && (
                  <div className="mb-4 sm:mb-5">
                    <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Eligibility
                      </h4>
                      <div className="text-xs sm:text-sm text-gray-600 leading-snug font-[Arial]">
                        {renderEligibility(program.eligibility)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Apply Now — links to the per-program URL from the API. */}
                {(() => {
                  const applyUrl =
                    program.url ||
                    program.apply_url ||
                    program.link ||
                    program.apply_link ||
                    "";
                  return (
                    <div className="mt-auto">
                      <a
                        href={applyUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!applyUrl) {
                            e.preventDefault();
                            return;
                          }
                          // Explicit window.open guarantees the navigation
                          // even if the anchor's default click is somehow
                          // intercepted upstream.
                          e.preventDefault();
                          window.open(applyUrl, "_blank", "noopener,noreferrer");
                        }}
                        className="block w-full text-center bg-[#F04E30] text-white font-medium py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg hover:bg-[#122E5E] transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
                      >
                        {settings.apply_label || "Apply Now"}
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* ================= EMPTY STATE ================= */}
        {filteredPrograms.length === 0 && (
          <div className="subprog-empty">
            <GraduationCap size={60} className="sub-empty-icon" />
            <h3 className="sub-empty-title">No Programs Found</h3>
            {searchQuery && <p className="subprog-empty-hint">Try a different search term</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default SubPrograms;
