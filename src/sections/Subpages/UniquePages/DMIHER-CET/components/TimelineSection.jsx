import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { renderIcon } from "../../../../../utils/renderIcon";

const buildCtaPath = (collegeSlug, ctaKey) => {
  if (!ctaKey) return null;
  if (collegeSlug) return `/${collegeSlug}/${ctaKey}`;
  return `/${ctaKey}`;
};

const PhaseCard = ({ phase, collegeSlug }) => {
  const cta = phase.primaryCta;
  const path = cta?.hasMicroPage ? buildCtaPath(collegeSlug, cta.ctaKey) : null;

  const inner = (
    <>
      <div className="dcet-phase-icon-wrap">
        {phase.icon ? renderIcon(phase.icon, 24, "dcet-phase-icon") : <Calendar className="dcet-phase-icon" />}
      </div>
      <h3 className="dcet-phase-title">{phase.phase}</h3>
      <p className="dcet-phase-month">{phase.month}</p>
      {path ? (
        <div className="dcet-phase-cta">
          <span className="dcet-phase-cta-text">Learn More</span>
          <ArrowRight className="dcet-phase-cta-icon" />
        </div>
      ) : null}
    </>
  );

  const baseClass = "dcet-phase-card group";

  if (path) {
    return (
      <Link to={path} className={baseClass}>
        {inner}
      </Link>
    );
  }

  return <div className={baseClass}>{inner}</div>;
};

const TimelineSection = ({ header, bannerText, bannerIcon, phases = [], collegeSlug }) => {
  if (!phases.length && !header?.heading && !bannerText) return null;

  return (
    <div className="dcet-section-plain">
      <div className="dcet-container">
        {bannerText ? (
          <div className="bg-white/10 text-[#555555] rounded-lg p-6 max-w-2xl mb-8">
            <div className="text-3xl font-bold flex items-center gap-2 text-gray-800">
              {bannerIcon ? renderIcon(bannerIcon, 40, "w-10 h-10 p-1") : <Calendar className="w-10 h-10 p-1" />}
              <span>{bannerText}</span>
            </div>
          </div>
        ) : null}

        {header?.heading ? (
          <h2 className="dcet-section-title-mb12">
            {header.heading}
          </h2>
        ) : null}

        {phases.length ? (
          <div className="dcet-grid-3-col">
            {phases.map((phase, idx) => (
              <PhaseCard
                key={`${phase.phase}-${idx}`}
                phase={phase}
                collegeSlug={collegeSlug}
              />
            ))}
          </div>
        ) : (
          <p className="dcet-empty-italic">
            Timeline details will be announced soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default TimelineSection;
