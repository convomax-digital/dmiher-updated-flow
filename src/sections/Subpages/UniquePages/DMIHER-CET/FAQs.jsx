import React, { useState } from "react";

const faqs = [
  {
    question: "How can I apply for admission to DMIHER?",
    answer:
      "Students can apply online through the Admissions Portal by filling out the application form, uploading necessary documents, and paying the application fees.",
  },
  {
    question:
      "Is there an entrance exam required for admission to UG or PG programs?",
    answer:
      "Yes, DMIHER-CET or any state-level or national-level entrance exam approved by UGC and AICTE is required.",
  },
  {
    question: "Is DMIHER-CET applicable for all colleges at DMIHER?",
    answer:
      "No, DMIHER-CET is applicable for admissions in Nursing, Engineering, Pharmacy, Physiotherapy, Allied Health Science/Paramedical, Management, and Technology domains.",
  },
  {
    question: "What documents are required for the admission process?",
    answer:
      "Required documents include academic transcripts, ID proof, passport-size photographs, and any additional certificates based on eligibility criteria.",
  },
  {
    question:
      "If a student hasn’t given any entrance exam before admission, what can they do?",
    answer: "Students can take the DMIHER-CET for admission at DMIHER.",
  },
  {
    question: "Are there any scholarships or financial aid options available?",
    answer:
      "Yes, the institute offers scholarships and financial aid options based on merit and need and has partnered with financing agencies for additional support.",
  },
  {
    question: "Is any government scholarship provided in DMIHER?",
    answer:
      "Yes, DMIHER provides government scholarships based on students' merit scores.",
  },
  {
    question:
      "Can I visit the institute before applying, and do you offer campus tours?",
    answer:
      "Yes, prospective students are welcome to visit the institute and take guided campus tours before applying.",
  },
  {
    question: "Does the institute offer mental health counseling?",
    answer:
      "Yes, students can access mental health counseling services through the Student Counseling Cell.",
  },
  {
    question:
      "Are there opportunities for research or internships for students?",
    answer:
      "Yes, the institute provides opportunities for both research and internships as part of academic and professional development programs.",
  },
  {
    question: "Are students provided with career counseling sessions?",
    answer:
      "Yes, career counseling sessions are conducted to help students explore job opportunities and career paths.",
  },
  {
    question:
      "Does the institute have tie-ups with companies for job placements?",
    answer:
      "Yes, DMIHER collaborates with various companies for recruitment and placement drives.",
  },
  {
    question: "Do you have hostel facilities on campus?",
    answer:
      "Yes, DMIHER has well-equipped in-campus hostel facilities for both boys and girls.",
  },
  {
    question:
      "Are international students eligible to apply for these programs?",
    answer:
      "Yes, international students can apply, provided they meet the eligibility criteria and submit necessary documentation.",
  },
  {
    question:
      "What measures does the institute take to ensure campus safety and security?",
    answer:
      "The institute ensures campus safety through its Anti-Ragging Cell and other security measures to prioritize a safe and secure learning environment.",
  },
];

const AdmissionFAQs = () => {
  const [openIdx, setOpenIdx] = useState(-1);

  return (
    <div className="pb-10 px-5" id="admission-faqs">
      <div className="container">
        <div className="max-w-4xl pb-5">
          <h2 className="text-2xl mt-5 md:pt-10 sm:text-3xl md:text-4xl text-[#555555] mb-2 font-oswald-medium font-[500] tracking-tight leading-tight ">
            <span className="block border-t-4 border-[#91288D] w-20 sm:w-24 mb-2 mr-4"></span>
            FAQ'S
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
