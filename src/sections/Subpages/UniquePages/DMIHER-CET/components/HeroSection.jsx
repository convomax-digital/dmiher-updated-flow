import React from "react";

const HeroSection = ({ heading, description }) => {
  if (!heading && !description) return null;

  return (
    <>
      {heading ? (
        <div>
          <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] mb-5 tracking-wide uppercase font-oswald-medium">
            <hr className="w-16 sm:w-20 border-[#91288D] mb-3 border-t-4" />
            {heading}
          </h2>
        </div>
      ) : null}

      {description ? (
        <div
          className="text-lg mb-8 opacity-90 text-[#555555] max-w-4xl leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}
    </>
  );
};

export default HeroSection;
