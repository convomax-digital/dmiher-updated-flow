const GlobalCentres = ({ data }) => {
  const heading = data?.heading || "INTERNATIONAL CENTRES";
  const description = data?.description || "";
  const centres = data?.centres || [];

  return (
    <section className="container py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#555555] mb-8 font-oswald-medium font-[500] tracking-tight leading-tight">
        <span className="block border-t-4 border-[#91288D] w-20 sm:w-24 mb-2"></span>
        {heading}
      </h2>

      {description && (
        <p className="text-[#555555] max-w-[1000px] mb-4">{description}</p>
      )}

      {centres.length > 0 && (
        <p className="text-[#555555]">
          {centres.map((c, i) => (
            <span key={i}>
              {c.name}
              {i < centres.length - 1 && <br />}
            </span>
          ))}
        </p>
      )}
    </section>
  );
};

export default GlobalCentres;
