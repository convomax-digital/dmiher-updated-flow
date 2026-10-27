import React, { useState, useMemo } from "react";
import { BookOpen, Building2, Star } from "lucide-react";
import LucideIcons from "../../utils/lucideIcons";
import TopUI from "../../components/TranscriptTopUI";
import { useParams, useLocation } from "react-router-dom";
import { useMicropageData } from "../../hooks/useMicropageData";

/**
 * Transcript subpage — backend-driven renderer for every institute transcript
 * pattern found on the live site:
 *
 *   • JNMC / DMMC — a "Course Categories" overview + a flat card grid.
 *   • SPDC / RNPC — multiple titled sections (e.g. UG + PG), each a card grid.
 *   • FEAT        — a department dropdown that swaps the visible grid.
 *   •  …          — an interactive "Category Filter" variant.
 *
 * Which pattern shows is decided entirely by the data the backend sends
 * (the `transcript_subpage` schema: an optional `header` with category pills
 * plus a repeatable `section[]`, each `normal` or `categories`). The API may
 * return that section as a single object OR — when there is more than one —
 * a plain array, which is why multi-section is handled explicitly here.
 */

// Resolve a CMS kebab-case icon name (e.g. "notebook-pen") against the shared
// 168-icon catalog the admin icon picker is generated from, so ANY icon a user
// picks in the dashboard renders. Falls back to the supplied default.
const toPascal = (s) =>
  String(s || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
const resolveIcon = (name, fallback = BookOpen) =>
  LucideIcons[toPascal(name)] || fallback;

/* ------------------------------------------------------------------ *
 *  Data normalisation
 * ------------------------------------------------------------------ */

// Course shape used by the card. Real data carries `badge` (the category /
// level pill); `star` is the schema's alias, so fall back to it.
const mapCourse = (c, i, sec = {}) => ({
  srNo: i + 1,
  name: c.title,
  semester: c.semester ?? c.roman_number,
  course_number: c.course_number,
  roman_number: c.roman_number,
  university: c.university,
  // Per-section provider label ("Powered by" default; SPDC PG uses
  // "Certified by"). Course-level overrides the section-level default.
  university_label: c.university_label || sec.university_label,
  badge: c.badge ?? c.star,
  // Star badge (body) text + icon — supports the elective-style `badge_text` /
  // `star_label` fields as well as the transcript's `badge` / `badge_icon`.
  badge_text: c.badge_text ?? c.badge ?? c.star,
  icon: c.icon,
  powered_icon: c.powered_icon,
  badge_icon: c.star_label ?? c.badge_icon,
});

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
};

// One section → one renderable block: { title, subtitle, top_ui, departments }.
function normalizeSection(sec) {
  if (!sec || typeof sec !== "object") return null;

  const title = sec.title || sec.main_heading || sec.heading || "";
  const subtitle = sec.subtitle || sec.description || "";

  // --- FEAT: department dropdown ---------------------------------
  if (Array.isArray(sec.departments)) {
    return {
      title,
      subtitle,
      top_ui: sec.top_ui?.type ? sec.top_ui : { type: "dropdown" },
      departments: sec.departments.map((dept, di) => ({
        id: dept.id ?? dept.name ?? di,
        name: dept.name,
        category: dept.name,
        // FEAT ships raw department courses with only a roman_number; surface
        // a sequential "Course #N" and render the roman figure as a
        // "Semester :" line (live-site layout), scoped via headerShowsSemester.
        electives: (dept.electives || dept.courses || []).map((c, i) => ({
          ...mapCourse(c, i, sec),
          course_number: c.course_number ?? i + 1,
          semester: c.semester ?? c.roman_number,
          headerShowsSemester: true,
        })),
      })),
    };
  }

  // --- Interactive category filter ------------------------------
  if (sec.tab_type === "categories") {
    const categories = Array.isArray(sec.categories) ? sec.categories : [];
    const coursesCategory = Array.isArray(sec.courses_category)
      ? sec.courses_category
      : [];

    return {
      title,
      subtitle,
      top_ui: {
        type: "category",
        categories: categories.map((c) => c.name || c.title || c.id),
      },
      departments: categories.map((cat) => ({
        id: cat.id,
        name: cat.name || cat.title,
        category: cat.name || cat.title,
        electives: coursesCategory
          .filter((c) => c.category_id === cat.id)
          .map((c, i) => mapCourse(c, i, sec)),
      })),
    };
  }

  // --- Normal flat grid -----------------------------------------
  const normal = Array.isArray(sec.courses_normal)
    ? sec.courses_normal.flat()
    : [];

  return {
    title,
    subtitle,
    top_ui: { type: "none" },
    departments: [
      {
        id: "general",
        name: "General",
        category: "All",
        electives: normal.map((c, i) => mapCourse(c, i, sec)),
      },
    ],
  };
}

// Header → the "Course Categories" overview (display-only pills).
function buildOverview(header) {
  const h = Array.isArray(header) ? header[0] : header;
  if (!h || typeof h !== "object") return null;

  const categories = (h.categories || [])
    .map((c) => c.title || c.name || c.id)
    .filter(Boolean);

  if (!categories.length) return null;

  return {
    // Fixed label like the live JNMC/DMMC pages; a dedicated field can
    // override it but it must not reuse the hero title (main_heading).
    heading: pick(h, "categories_heading", "categories_title") || "Course Categories",
    subtitle: pick(h, "categories_subtitle", "subtitle", "description") || "",
    categories,
  };
}

// Top-level data (single object | array | { header, section[] }) → model.
function buildModel(data) {
  const empty = { pageTitle: "Transcript", overview: null, blocks: [] };
  if (!data || typeof data !== "object") return empty;

  let rawSections;
  let header = null;
  let bareSingle = false;

  if (Array.isArray(data)) {
    rawSections = data;
  } else if (Array.isArray(data.section)) {
    rawSections = data.section;
    header = data.header ?? null;
  } else {
    rawSections = [data];
    header = data.header ?? null;
    bareSingle = !header; // a lone section object with no header wrapper
  }

  const blocks = rawSections.map(normalizeSection).filter(Boolean);
  const overview = buildOverview(header);

  const headerObj = Array.isArray(header) ? header[0] : header;
  let pageTitle =
    pick(headerObj || {}, "main_heading", "heading") ||
    pick(bareSingle ? data : {}, "page_title", "main_heading");

  // A bare single section carries its own title as the page title; promote it
  // to the hero and suppress the otherwise-duplicate section heading.
  if (!pageTitle && bareSingle && blocks[0]?.title) {
    pageTitle = blocks[0].title;
    blocks[0].suppressHead = true;
  }

  pageTitle = pageTitle || "Transcript";

  return { pageTitle, overview, blocks };
}

/* ------------------------------------------------------------------ *
 *  Presentational pieces
 * ------------------------------------------------------------------ */

function CourseGrid({ courses = [] }) {
  if (!courses.length) {
    return <p className="course-empty">No courses available</p>;
  }

  return (
    <section className="courses-section">
      <div className="courses-wrapper">
        <div className="course-grid">
          {courses.map((course, i) => {
            const IconComponent = resolveIcon(course.icon);
            const PoweredIcon = resolveIcon(course.powered_icon, Building2);
            const BadgeIcon = resolveIcon(course.badge_icon, Star);
            return (
              <div key={course.srNo ?? i} className="course-card group">
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
                        {course.headerShowsSemester && course.semester ? (
                          <div className="course-card-semester">
                          {course.semester}
                          </div>
                        ) : (
                          course.badge && (
                            <div className="course-card-mini-badge">
                              {course.badge}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    {/* {course.roman_number && (
                      <div className="course-card-roman">
                        <span className="course-card-roman-text">
                          {course.roman_number}
                        </span>
                      </div>
                    )} */}
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
                          <p className="course-card-univ-label">
                            {course.university_label || "Powered by"}
                          </p>
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
}

// A single section: heading + (dropdown / category controls) + grid(s).
// Owns its own selection state so multiple blocks don't clash.
function TranscriptBlock({ block }) {
  const { title, subtitle, top_ui, departments } = block;

  const [selectedDept, setSelectedDept] = useState(
    departments[0]?.name || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    top_ui?.categories?.[0] || null
  );

  const visibleDepartments =
    top_ui?.type === "dropdown"
      ? departments.filter((d) => d.name === selectedDept)
      : top_ui?.type === "category"
      ? departments.filter((d) => d.category === selectedCategory)
      : departments;

  return (
    <section className="transcript-section">
      {!block.suppressHead && (title || subtitle) && (
        <div className="transcript-section-head">
          {title && <h2 className="transcript-section-title">{title}</h2>}
          {subtitle && (
            <p className="transcript-section-subtitle">{subtitle}</p>
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
          <CourseGrid key={dept.id} courses={dept.electives} />
        ))
      ) : (
        <p className="course-empty-text">No courses available</p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Page
 * ------------------------------------------------------------------ */

function Transcript({ data: propData, college: propCollege }) {
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

  const model = useMemo(() => {
    if (propData) return buildModel(propData);
    // The transcript content may be preceded by tab-link menus, so prefer the
    // transcript section by id and fall back to the first section.
    const sec =
      sections?.find((s) => s.section_id === "transcript_subpage") ||
      sections?.[0];
    return buildModel(sec?.data);
  }, [propData, sections]);

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
    <div className="transcript-page">
      <header className="transcript-header">
        <h1 className="transcript-title">{model.pageTitle}</h1>
      </header>

      <div className="transcript-content">
        {/* Course Categories overview (JNMC / DMMC) — display only */}
        {model.overview && (
          <section className="transcript-section">
            <div className="transcript-section-head">
              <h2 className="topui-category-title">{model.overview.heading}</h2>
              {model.overview.subtitle && (
                <p className="topui-category-subtitle">
                  {model.overview.subtitle}
                </p>
              )}
            </div>
            <div className="transcript-categories">
              {model.overview.categories.map((cat, i) => (
                <span key={i} className="transcript-category-pill">
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}

        {model.blocks.length > 0 ? (
          model.blocks.map((block, i) => (
            <TranscriptBlock key={i} block={block} />
          ))
        ) : (
          <p className="course-empty-text">No transcript data available.</p>
        )}
      </div>
    </div>
  );
}

export default Transcript;
