import { Link } from "react-router-dom";
import RichTextRenderer from "../../../components/RichTextRenderer";

const DALNurturingEcosystem = ({ data }) => {
  const heading = data?.heading || "";
  const subheading = data?.subheading || "";
  const bold_intro = data?.bold_intro || "";
  const description = data?.description || "";
  const buttons = data?.buttons || [];

  return (
    <div className="w-full px-4 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto text-center">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-[500] text-[#555555] tracking-wide uppercase font-oswald-medium">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="text-base text-[#555555] mt-3">{subheading}</p>
        )}
        {bold_intro && (
          <p className="text-sm font-semibold text-[#132F5C] mt-6">
            {bold_intro}
          </p>
        )}
        {description && (
          <div className="text-sm text-[#555555] mt-3 leading-7">
            <RichTextRenderer html={description} />
          </div>
        )}

        {buttons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {buttons.map((btn, i) => {
              const label = btn.label || "";
              const url = btn.url || "#";
              const isExternal = /^https?:\/\//i.test(url);
              const buttonEl = (
                <button className="inst-cta-btn">{label}</button>
              );
              if (isExternal) {
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inst-cta-link-wrap"
                  >
                    {buttonEl}
                  </a>
                );
              }
              return (
                <Link key={i} to={url} className="inst-cta-link-wrap">
                  {buttonEl}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DALNurturingEcosystem;
