import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SafeImage from "../../../components/SafeImage";

const AlumniCard = ({ person, index, expandedIndex, setExpandedIndex }) => {
  const expanded = expandedIndex === index;
  const cardRef = useRef(null);

  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setExpandedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded, setExpandedIndex]);

  return (
    <div
      ref={cardRef}
      className={`alumni-card ${expanded ? "h-[600px]" : "h-[140px]"}`}
      onClick={() => !expanded && setExpandedIndex(index)}
    >
      {expanded && (
        <button
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedIndex(null);
          }}
        >
          <X size={18} />
        </button>
      )}

      {/* Collapsed */}
      <div
        className={`alumni-collapsed ${
          expanded ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <SafeImage
          src={person.image}
          alt={person.name}
          className="alumni-img"
        />
        <div>
          <h2 className="alumni-name">{person.name}</h2>
          <p className="alumni-meta">{person.batch}</p>
          <p className="alumni-meta">Institution: {person.college}</p>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="alumni-expanded">
          <div className="text-center mb-4">
            <SafeImage
              src={person.image}
              alt={person.name}
              className="alumni-expanded-img"
            />
            <h2 className="alumni-name">{person.name}</h2>
            <p className="alumni-meta">{person.batch}</p>
            <p className="alumni-meta">Institution: {person.college}</p>
          </div>

          <p className="alumni-details">{person.details}</p>
        </div>
      )}
    </div>
  );
};

const EminentAlumni = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // VIEW ALL micro-page CTA — the CMS sends { label, cta_key, has_micro_page }
  // at the data root (or inside data.cta). The button links to
  // {current path}/{cta_key} (e.g. /alumni/Eminent-Alumni) and hides entirely
  // when no micro page is configured, instead of rendering a dead "#" link.
  const { pathname } = useLocation();
  const base = pathname.replace(/\/+$/, "");
  const cta = data?.cta || {};
  const ctaKey =
    cta.has_micro_page && cta.cta_key
      ? cta.cta_key
      : data?.has_micro_page && data?.cta_key
        ? data.cta_key
        : null;
  const viewAllLink = ctaKey ? (base ? `${base}/${ctaKey}` : `/${ctaKey}`) : null;
  const viewAllLabel = data?.label || cta.label || "VIEW ALL";

  return (
    <div className="alumni-section container">

      {/* Header */}
      <div className="alumni-header">
        <h2 className="alumni-title">
          <span className="block border-t-4 border-[#91288D] w-24 mb-4"></span>
          {data?.basic?.title || "Eminent Alumni"}
        </h2>

        {viewAllLink && (
          <Link to={viewAllLink} className="alumni-btn">
            {viewAllLabel} →
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="alumni-grid">
        {data?.alumni?.map((person, index) => (
          <AlumniCard
            key={index}
            person={person}
            index={index}
            expandedIndex={expandedIndex}
            setExpandedIndex={setExpandedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default EminentAlumni;