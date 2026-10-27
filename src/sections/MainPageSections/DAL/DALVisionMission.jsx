import { resolveImage } from "../../../utils/resolveImage";

const DALVisionMission = ({ data }) => {
  const vision = data?.vision || {};
  const mission = data?.mission || {};

  return (
    <div className="w-full px-4 sm:px-8 md:px-15 lg:px-35 py-10 sm:py-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-0">
        {/* Vision */}
        <div className="bg-[#F7941D] p-5 sm:p-8 md:p-12 shadow-md min-h-[370px] text-white">
          <div className="flex justify-between items-start mb-2">
            <div className="pt-5 sm:pt-12">
              <hr className="w-16 sm:w-20 border-[#91288D] mb-2 border-t-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide font-oswald-medium">
                {vision.title || "Vision"}
              </h2>
            </div>
            {vision.icon && (
              <img
                src={resolveImage(vision.icon)}
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                alt="Vision Icon"
              />
            )}
          </div>
          {vision.text && (
            <p className="text-lg leading-relaxed">{vision.text}</p>
          )}
        </div>

        {/* Mission */}
        <div className="bg-[#555555] p-6 sm:p-8 text-white shadow-md min-h-[360px]">
          <div className="flex justify-between items-start mb-2">
            <div className="pt-5 sm:pt-16">
              <hr className="w-16 sm:w-20 border-[#91288D] mb-2 border-t-4" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide font-oswald-medium">
                {mission.title || "Mission"}
              </h2>
            </div>
            {mission.icon && (
              <img
                src={resolveImage(mission.icon)}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
                alt="Mission Icon"
              />
            )}
          </div>
          {mission.text && (
            <p className="text-lg leading-relaxed">{mission.text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DALVisionMission;
