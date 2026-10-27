import { Link } from "react-router-dom";

const UsefulLinks = ({ data }) => {
  const heading = data?.heading || "USEFUL LINKS";
  const links = data?.links || [];

  if (!links.length) return null;

  return (
    <div className="py-15 bg-white">
      <div className="container">
        <h2 className="text-3xl sm:text-4xl ml-4 md:ml-0 font-[500] font-oswald-medium tracking-wider mb-10 text-[#555555]">
          <hr className="w-12 sm:w-20 border-[#91288D] mb-2 border-t-4" />
          {heading}
        </h2>

        <div className="flex flex-wrap gap-4 justify-center px-4 md:px-0">
          {links.map((item, i) => {
            // Support both the new schema (line1 + line2) and the legacy
            // shape (text: ["line1","line2"]) used by older seeds.
            const lines = Array.isArray(item.text)
              ? item.text
              : [item.line1, item.line2].filter(Boolean);

            const bg = item.bg_color || "#13294B";
            const color = item.text_color || "#FFFFFF";
            const cls =
              "hover:scale-103 flex flex-col justify-center items-center px-4 py-6 rounded-md text-center font-[Arial] text-lg w-full sm:w-[48%] md:w-[30%] lg:w-[18%] min-h-[160px]";
            const style = { backgroundColor: bg, color };

            const inner = lines.map((line, j) => (
              <span
                key={j}
                className="text-sm sm:text-base md:text-2xl font-light font-oswald-medium"
                style={{ color }}
              >
                {line}
              </span>
            ));
            return item.url ? (
              <Link key={i} to={item.url} className={cls} style={style}>
                {inner}
              </Link>
            ) : (
              <button key={i} className={cls} style={style}>
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsefulLinks;
