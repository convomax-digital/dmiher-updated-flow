import RichTextRenderer from "../../../components/RichTextRenderer";

const AdvantageIndia = ({ data }) => {
  const heading = data?.header?.heading || "ADVANTAGE INDIA";
  const points = data?.points || [];

  if (!points.length) return null;

  return (
    <div className="py-16 px-6 bg-[#F7941D]/10 flex justify-center">
      <div className="w-full container bg-white py-10 px-5">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-oswald-medium tracking-normal text-[#555555] font-semibold mb-10">
          <div className="border-t-4 border-[#7E2279] w-20 mb-2"></div>
          {heading}
        </h2>

        {/* Info Items: 6-column grid with dividers */}
        <div className="grid grid-cols-1 md:grid-cols-6 divide-x divide-gray-300 text-xl md:text-base text-gray-700">
          {points.map((item, idx) => (
            <div key={idx} className="px-4 mb-6 md:mb-0">
              <RichTextRenderer html={item.text || ""} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvantageIndia;
