import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
};

const HOVERS = {
  instagram: "hover:text-pink-400",
  facebook: "hover:text-blue-500",
  linkedin: "hover:text-blue-300",
  youtube: "hover:text-red-500",
};

const SocialLinks = ({ data }) => {
  const heading = data?.heading || "Social Media Links";
  const links = data?.links || [];

  if (!links.length) return null;

  return (
    <div className="pt-16 flex justify-center">
      <div className="mx-auto container">
        <h2 className="text-3xl sm:text-4xl mx-auto ml-4 md:ml-0 font-[500] font-oswald-medium tracking-wider mb-10 text-[#555555] uppercase">
          <hr className="w-12 sm:w-20 border-[#91288D] mb-2 border-t-4" />
          {heading}
        </h2>

        <div className="grid max-w-4xl mx-auto grid-cols-3 gap-6 text-center mb-10 w-full">
          {links.map((item, i) => {
            const Icon = ICONS[item.platform] || FaInstagram;
            const hover = HOVERS[item.platform] || "hover:text-blue-300";
            const hoverStyle = item.hover_color
              ? { ":hover": { color: item.hover_color } }
              : undefined;
            return (
              <div key={i} className="flex md:flex-col items-center">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${hover} text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto`}
                  style={hoverStyle}
                >
                  <Icon className="w-10 h-10" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
