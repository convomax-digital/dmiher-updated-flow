import { MapPin } from "lucide-react";
import DropdownButton from "./DropDownButton";

const TopUI = ({
  topUI,
  departments,
  selectedDept,
  setSelectedDept,
  selectedCategory,
  setSelectedCategory,
}) => {
  if (!topUI || !topUI.type) return null;

  /* ---------------- DROPDOWN ---------------- */
  if (topUI.type === "dropdown") {
    const options = departments.reduce((acc, dept) => {
      acc[dept.name] = { name: dept.name };
      return acc;
    }, {});

    return (
      <div className="topui-dropdown-wrapper">
        <div className="topui-dropdown-inner">
          <DropdownButton
            options={options}
            selectedKey={selectedDept}
            onChange={setSelectedDept}
            placeholder="Select Department"
          />
        </div>
      </div>
    );
  }

  /* ---------------- CATEGORY ---------------- */
  if (topUI.type === "category") {
    return (
      <section className="topui-category">
        {topUI.title && (
          <h2 className="topui-category-title">{topUI.title}</h2>
        )}

        {topUI.subtitle && (
          <p className="topui-category-subtitle">{topUI.subtitle}</p>
        )}

        {/* Tab bar — markup copied from the live-site elective tabs: an orange
            active pill (scaled up), gray labels that fill navy on hover, each
            with a MapPin icon. */}
        <div className="flex flex-wrap justify-center gap-3 p-2">
          {topUI.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-12 py-4 m-1 font-bold text-lg transition-all duration-300 rounded-2xl transform hover:scale-105 ${
                selectedCategory === cat
                  ? "bg-[#91288D] text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-[#132F5C] hover:text-white hover:shadow-md"
              }`}
            >
              <MapPin className="h-5 w-5 inline mr-2" />
              {cat}
            </button>
          ))}
        </div>
      </section>
    );
  }

  /* ---------------- HEADING ---------------- */
  if (topUI.type === "heading") {
    return (
      <div className="topui-heading">
        <h2 className="topui-heading-title">{topUI.title}</h2>

        {topUI.subtitle && (
          <p className="topui-heading-subtitle">{topUI.subtitle}</p>
        )}
      </div>
    );
  }

  return null;
};

export default TopUI;
