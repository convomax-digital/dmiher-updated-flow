import React from "react";
import { BookOpen, Building2, Star } from "lucide-react";

function TranscriptSubpage({ data }) {
  const headerData = data?.header?.[0];
  const sections = data?.section || [];

  if (!headerData && !sections.length) {
    return (
      <div className="p-10 text-center text-gray-500">
        No transcript data available.
      </div>
    );
  }

  const categories = headerData?.categories || [];

  return (
    <div className="transcript-page">
      {/* ── HERO ── */}
      <header className="transcript-header">
        <h1 className="transcript-title">Transcript Courses</h1>
      </header>

      <div className="transcript-content">
        {/* ── COURSE CATEGORIES OVERVIEW ── */}
        {headerData && categories.length > 0 && (
          <section className="transcript-section">
            <div className="transcript-section-head">
              <h2 className="topui-category-title">
                {headerData.main_heading || "Course Categories"}
              </h2>
              {headerData.subtitle && (
                <p className="topui-category-subtitle">{headerData.subtitle}</p>
              )}
            </div>
            <div className="transcript-categories">
              {categories.map((cat) => (
                <span key={cat.id} className="transcript-category-pill">
                  {cat.title}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── AVAILABLE COURSES HEADING ── */}
        {headerData && (headerData.heading || headerData.description) && (
          <section className="transcript-section">
            <div className="topui-heading">
              <h2 className="topui-heading-title">
                {headerData.heading || "Available Courses"}
              </h2>
              {headerData.description && (
                <p className="topui-heading-subtitle">
                  {headerData.description}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── COURSE SECTIONS ── */}
        {sections.map((sectionItem, sIdx) => (
          <section key={sIdx} className="transcript-section">
            {(sectionItem.title || sectionItem.subtitle) && (
              <div className="transcript-section-head">
                <h2 className="transcript-section-title">{sectionItem.title}</h2>
                {sectionItem.subtitle && (
                  <p className="transcript-section-subtitle">
                    {sectionItem.subtitle}
                  </p>
                )}
              </div>
            )}

            <section className="courses-section">
              <div className="courses-wrapper">
                <div className="course-grid">
                  {(sectionItem.courses_normal || []).length > 0 ? (
                    sectionItem.courses_normal.map((course, cIdx) => (
                      <div key={cIdx} className="course-card group">
                        {/* Header */}
                        <div className="course-card-header">
                          <div className="course-card-header-row">
                            <div className="course-card-header-left">
                              <div className="course-card-icon-wrap">
                                <BookOpen className="course-card-icon" />
                              </div>
                              <div>
                                {course.course_number && (
                                  <div className="course-card-num">
                                     #{course.course_number}
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

                        {/* Body */}
                        <div className="course-card-body">
                          {course.title && (
                            <h3 className="course-card-name group-hover:text-[#91288D]">
                              {course.title}
                            </h3>
                          )}

                          {course.university && (
                            <div className="course-card-univ-row">
                              <div className="course-card-univ-inner">
                                <div className="course-card-univ-icon-wrap">
                                  <Building2 className="course-card-univ-icon" />
                                </div>
                                <div>
                                  <p className="course-card-univ-label">Powered by</p>
                                  <p className="course-card-univ-name">
                                    {course.university}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {course.badge && (
                            <div className="course-card-badge-row">
                              <div className="course-card-badge group-hover:from-[#91288D]/10 group-hover:to-[#132F5C]/10">
                                <Star className="course-card-badge-icon" />
                                {course.badge}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="course-empty-text">No courses available.</p>
                  )}
                </div>
              </div>
            </section>
          </section>
        ))}
      </div>
    </div>
  );
}

export default TranscriptSubpage;
