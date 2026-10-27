import { Link } from "react-router-dom";

const ViewMoreButton = ({
  onClick,
  href,
  label = "View More",
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
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {label}
    </button>
  );
};

export default ViewMoreButton;
