import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Building2, Star } from "lucide-react";
import LucideIcons from "../../utils/lucideIcons";
import TopUI from "../../components/TranscriptTopUI";
import { useParams, useLocation } from "react-router-dom";
import { useMicropageData } from "../../hooks/useMicropageData";

// Resolve a CMS kebab-case icon name (e.g. "notebook-pen") against the shared
// 168-icon catalog that the admin icon picker is generated from, so ANY icon a
// user picks in the dashboard renders. Falls back to the supplied default.
const toPascal = (s) =>
  String(s || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
const resolveIcon = (name, fallback = BookOpen) =>
  LucideIcons[toPascal(name)] || fallback;

function ElectivesOffered({ data: propData, college: propCollege }) {
  const params = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const pageSlug = params.college || propCollege || pathSegments[0];
  const ctaKey = params.page || pathSegments[1];

  const { sections, loading, error } = useMicropageData(
    pageSlug,
    ctaKey,
    propData
  );

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const transformedData = React.useMemo(() => {
    const raw = propData ? propData : sections?.[0]?.data || {};

    // The admin can wrap the section in a { header, section:[…] } envelope to add
    // the highlights overview (like the live site). The API only unwraps a lone
    // { section:[one] }; a header present blocks that unwrap, so handle it here
    // — otherwise the whole page rendered empty.
    const header = Array.isArray(raw?.section)
      ? Array.isArray(raw.header)
        ? raw.header[0]
        : raw.header || null
      : null;
    const sectionData = Array.isArray(raw?.section)
      ? raw.section[0] || {}
      : raw;

    if (Array.isArray(sectionData?.departments)) {
      return {
        header,
        title: sectionData.title || "Electives Offered",
        subtitle: sectionData.subtitle || "",
        departments: sectionData.departments,
        top_ui: sectionData.top_ui || { type: "dropdown" },
      };
    }

    const tabType = sectionData?.tab_type;
    const title = sectionData?.title || "Electives Offered";
    const subtitle = sectionData?.subtitle || "";

    const mapCourse = (c, i) => ({
      srNo: i + 1,
      name: c.title,
      semester: c.roman_number,
      course_number: c.course_number,
      roman_number: c.roman_number,
      university: c.university,
      // Per-institute provider label. Most pages say "Powered by"; some
      // (e.g. SPDC PG) say "Certified by". Falls back to "Powered by".
      university_label: c.university_label || sectionData.university_label,
      badge: c.badge,
      // Star badge (body): electives store the text in a dedicated `badge_text`
      // field and the icon in `star_label`; fall back to badge / star /
      // badge_icon so transcripts and older data don't regress.
      badge_text: c.badge_text ?? c.badge ?? c.star,
      icon: c.icon,
      powered_icon: c.powered_icon,
      badge_icon: c.star_label ?? c.badge_icon,
    });

    if (tabType === "categories") {
      const categories = Array.isArray(sectionData.categories)
        ? sectionData.categories
        : [];
      const coursesCategory = Array.isArray(sectionData.courses_category)
        ? sectionData.courses_category
        : [];

      const departments = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        category: cat.name,
        electives: coursesCategory
          .filter((c) => c.category_id === cat.id)
          .map(mapCourse),
      }));

      return {
        header,
        title,
        subtitle,
        departments,
        top_ui: {
          type: "category",
          title: "",
          subtitle: "",
          categories: categories.map((c) => c.name),
        },
      };
    }

    const coursesNormalRaw = Array.isArray(sectionData.courses_normal)
      ? sectionData.courses_normal
      : [];
    const coursesNormal = coursesNormalRaw.flat();

    return {
      header,
      title,
      subtitle,
      departments: [
        {
          id: "general",
          name: "General",
          category: "All",
          electives: coursesNormal.map(mapCourse),
        },
      ],
      top_ui: {
        type: "heading",
        title: "",
        subtitle: "",
      },
    };
  }, [propData, sections]);

  useEffect(() => {
    if (loading) return;

    if (transformedData.departments.length > 0) {
      setSelectedDept(transformedData.departments[0].name);
    }
    if (transformedData.top_ui?.categories?.length > 0) {
      setSelectedCategory(transformedData.top_ui.categories[0]);
    }
  }, [transformedData, loading]);

  const renderCourses = useCallback(
    (courses = []) => {
      if (courses.length === 0) {
        return (
          <p className="course-empty">
            No entries available
          </p>
        );
      }

      return (
        <section className="courses-section">
          <div className="courses-wrapper">
            {/* Electives render 3-up on desktop (live-site layout); the shared
                .course-grid is 2-up which transcripts keep. */}
            <div className="course-grid is-electives">
              {courses.map((course, i) => {
                const IconComponent = resolveIcon(course.icon);
                const PoweredIcon = resolveIcon(course.powered_icon, Building2);
                const BadgeIcon = resolveIcon(course.badge_icon, Star);
                const cardKey = course.srNo ?? i;

                return (
                  <div
                    key={cardKey}
                    className="course-card group"
                    onMouseEnter={() => setHoveredCourse(cardKey)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    {/* Header */}
                    <div className="course-card-header">
                      <div className="course-card-header-row">
                        <div className="course-card-header-left">
                          <div className="course-card-icon-wrap">
                            <IconComponent className="course-card-icon" />
                          </div>
                          <div>
                            {course.course_number && (
                              <div className="course-card-num">
                                 {course.course_number}
                              </div>
                            )}
                            {course.badge && (
                              <div className="course-card-mini-badge">
                                {course.badge}
                              </div>
                            )}
                          </div>
                        </div>
                        {course.roman_number && (
                          <div className="course-card-roman">
                            <span className="course-card-roman-text">
                              {course.roman_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="course-card-body">
                      {course.name && (
                        <h3 className="course-card-name group-hover:text-[#91288D]">
                          {course.name}
                        </h3>
                      )}

                      {course.university && (
                        <div className="course-card-univ-row">
                          <div className="course-card-univ-inner">
                            <div className="course-card-univ-icon-wrap">
                              <PoweredIcon className="course-card-univ-icon" />
                            </div>
                            <div>
                              {/* <p className="course-card-univ-label">
                                {course.university_label}
                              </p> */}
                              <p className="course-card-univ-name">
                                {course.university}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {course.badge_text && (
                        <div className="course-card-badge-row">
                          <div className="course-card-badge group-hover:from-[#91288D]/10 group-hover:to-[#132F5C]/10">
                            <BadgeIcon className="course-card-badge-icon" />
                            {course.badge_text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    [hoveredCourse]
  );

  if (loading) {
    return (
      <div className="sub-loading-wrap">
        <div className="sub-loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sub-error">{error}</div>
    );
  }

  const { header, title, subtitle, departments = [], top_ui } = transformedData;

  const visibleDepartments =
    top_ui?.type === "dropdown"
      ? departments.filter((d) => d.name === selectedDept)
      : top_ui?.type === "category"
      ? departments.filter((d) => d.category === selectedCategory)
      : departments;

  return (
    <div className="transcript-page">
      {/* Header */}
      <header className="transcript-header">
        <h1 className="transcript-title">{title}</h1>
        {subtitle && <p className="transcript-subtitle">{subtitle}</p>}
      </header>

      <div className="transcript-content">
        {/* Highlights overview (admin "header") — mirrors the live-site
            highlight grid: a gradient icon circle over the CMS rich-text card. */}
        {Array.isArray(header?.categories) && header.categories.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto px-4 mb-12">
            {header.categories.map((cat, i) => {
              const HighlightIcon = resolveIcon(cat.icon);
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 transition-transform hover:scale-105"
                >
                  <div className="bg-gradient-to-r from-[#91288D] to-[#132F5C] p-4 rounded-full shadow-lg mx-auto w-fit mb-6">
                    <HighlightIcon className="h-8 w-8 text-white" />
                  </div>
                  {cat.content && (
                    <div dangerouslySetInnerHTML={{ __html: cat.content }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(header?.heading || header?.description) && (
          <div className="text-center max-w-7xl mx-auto px-4 mb-10">
            {header.heading && (
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#91288D] to-[#132F5C] bg-clip-text text-transparent mb-2">
                {header.heading}
              </h2>
            )}
            {header.description && (
              <p className="text-gray-600 text-lg font-medium">
                {header.description}
              </p>
            )}
          </div>
        )}

        <TopUI
          topUI={top_ui}
          departments={departments}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {visibleDepartments.length > 0 ? (
          visibleDepartments.map((dept) => (
            <div key={dept.id}>{renderCourses(dept.electives)}</div>
          ))
        ) : (
          <p className="course-empty-text">No entries available</p>
        )}
      </div>
    </div>
  );
}

export default ElectivesOffered;
