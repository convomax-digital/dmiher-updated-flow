import { Link } from "react-router-dom";
import RichTextRenderer from "../../../components/RichTextRenderer";
import { resolveImage } from "../../../utils/resolveImage";

const ImageContentBlocks = ({ data }) => {
  const blocks = data?.blocks || [];
  if (!blocks.length) return null;

  return (
    <div className="px-4 justify-center py-10">
      {blocks.map((block, i) => {
        const isRight = block.layout === "right_content";
        const labelDisabled = block?._disabled?.label === true;
        const urlDisabled = block?._disabled?.url === true;
        const showCta = block.label && block.url && !labelDisabled && !urlDisabled;

        return (
          <div
            key={i}
            className={`flex flex-col lg:flex-row gap-8 ${
              isRight ? "items-center" : "items-center"
            } container my-20 first:mt-0`}
          >
            {isRight && block.image && (
              <div className="relative w-full lg:w-[650px]">
                <img
                  src={resolveImage(block.image)}
                  alt={block.heading || ""}
                  className="h-auto object-cover rounded-2xl"
                />
              </div>
            )}

            <div
              className={`w-full ${
                isRight ? "lg:w-[500px] self-center" : "lg:w-[580px]"
              } pb-6 lg:pb-10`}
            >
              {block.heading && (
                <div className="mb-2">
                  <h2 className="text-3xl text-[#132F5C] mb-2 font-oswald-medium font-light tracking-tight leading-tight">
                    {block.heading}
                  </h2>
                </div>
              )}
              {block.description && (
                <div className="text-gray-500 text-base font-oswald font-[400] mb-3">
                  <RichTextRenderer html={block.description} />
                </div>
              )}
              {showCta && (
                <Link
                  to={block.url}
                  className="inline-block px-4 py-2 bg-[#91288D] text-white rounded text-sm font-semibold transition hover:bg-[#d13d22]"
                >
                  {block.label}
                </Link>
              )}
            </div>

            {!isRight && block.image && (
              <div className="relative w-full lg:w-[620px]">
                <img
                  src={resolveImage(block.image)}
                  alt={block.heading || ""}
                  className="h-auto object-cover rounded-2xl"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ImageContentBlocks;
