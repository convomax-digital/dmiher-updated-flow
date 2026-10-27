import React, { useState } from "react";

const AdmissionFAQs = ({data}) => {
  const [openIdx, setOpenIdx] = useState(-1);
  const { basic,faqs } = data;

  return (
    <div className="pb-10 px-5" id="admission-faqs">
      <div className="container">
        <div className="max-w-4xl pb-5">
          <h2 className="text-2xl mt-5 md:pt-10 sm:text-3xl md:text-4xl text-[#555555] mb-2 font-oswald-medium font-[500] tracking-tight leading-tight">
            <span className="block border-t-4 border-[#91288D] w-20 sm:w-24 mb-2 mr-4"></span>
      {basic.title}
          </h2>

          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                className={`w-full text-left py-3 px-2 border-gray-300 flex justify-between items-center font-semibold text-base sm:text-lg ${
                  openIdx === idx ? "text-[#222]" : "text-[#555555] border-b"
                }`}
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              >
                <span>{faq.question}</span>
                <span className="text-xl font-bold">
                  {openIdx === idx ? "-" : "+"}
                </span>
              </button>

              {openIdx === idx && (
                <div className="px-2 pb-3 text-sm text-[#555555] border-b border-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmissionFAQs;