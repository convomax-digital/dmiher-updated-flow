import { useParams } from "react-router-dom";
import Seo from "../components/Seo";

import ErrorBoundary from "../components/ErrorBoundary";
import PageSkeleton from "../components/Skeletons/PageSkeleton";

import {
  MandatoryDisclosureSection,
  useMandatoryDisclosure,
} from "../instituteSections/mandatoryDisclosure";

/**
 * Standalone route page for Mandatory Disclosures.
 *
 *   L1 : /:college/mandatory-disclosure
 *   L2 : /:college/mandatory-disclosure/:nestedPage
 *   L3 : /:college/mandatory-disclosure/:nestedPage/:nestedSlug
 *
 * Per requirement #6, this route does NOT render the UI component
 * independently — it routes through the InstituteSections module
 * (MandatoryDisclosureSection), which centralizes the mapping layer.
 */
function MandatoryDisclosurePage() {
  const { college, nestedPage, nestedSlug } = useParams();

  const { data, isLoading, isError } = useMandatoryDisclosure(
    college,
    nestedPage,
    nestedSlug
  );

  if (!college) {
    return (
      <div className="error-boundary-fallback">
        <p className="error-boundary-text">Page not found</p>
      </div>
    );
  }

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="error-boundary-fallback">
        <p className="error-boundary-text">Page not found</p>
      </div>
    );
  }

  const hasContent =
    data &&
    ((Array.isArray(data.items) && data.items.length > 0) ||
      (Array.isArray(data.tabs) &&
        data.tabs.some((t) => t && Array.isArray(t.items) && t.items.length > 0)));

  if (!hasContent) {
    return (
      <div className="error-boundary-fallback">
        <p className="error-boundary-text">No data available</p>
      </div>
    );
  }

  // On L3 the parent context is the L2 cardSlug; on L2 there is no parent
  // (cards still need to point UP into L3 via parentSlug = nestedPage).
  const parentSlug = nestedSlug ? nestedPage : nestedPage || "";

  return (
    <main className="fade-in">
      <Seo title={data.title || "Mandatory Disclosures"} />

      <ErrorBoundary>
        <section>
          <MandatoryDisclosureSection
            data={data}
            college={college}
            parentSlug={parentSlug}
          />
        </section>
      </ErrorBoundary>
    </main>
  );
}

export default MandatoryDisclosurePage;
