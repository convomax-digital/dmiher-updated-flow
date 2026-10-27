import React from "react";
import { Link } from "react-router";

const ViewMoreButton = ({
  onClick,
  href,
  label = "",
  className = "",
  target = "",
}) => {
  const baseClasses =
    "mt-2 mb-4 px-6 py-2 bg-[#91288D] hover:bg-[#132F5C] hover:scale-105 transition-transform duration-200 text-white rounded font-semibold ";

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseClasses} ${className}`}
        target={target}
        rel="noopener noreferrer"
      >
        {label}
      </Link>
    );
  } else if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gray-100 hover:bg-[#91288D] text-gray-700 hover:text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium block text-center"
      >
        {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {label}
    </button>
  );
};

export default ViewMoreButton;
