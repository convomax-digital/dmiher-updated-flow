import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageView from "./PageView";
import PageLoader from "./components/PageLoader";
import { mandatoryDisclosureConfig } from "./instituteSections/mandatoryDisclosure/config";
import useSiteSettings from "./hooks/useSiteSettings";
import NiaaChatbot from "./components/NiaaChatbot";
import HomePopup from "./components/HomePopup";

// Route-level code splitting: these page types are only needed when the user
// navigates to them, so they're loaded on demand instead of bloating the
// initial home-page bundle. PageView (the home/slug route) stays eager.
const SubPrograms = lazy(() => import("./sections/Subpages/Programs"));
const HeadPrograms = lazy(() => import("./sections/Subpages/HeadPrograms"));
const DepartmentsSubpage = lazy(() => import("./sections/Subpages/Departments"));
const MandatoryDisclosurePage = lazy(() => import("./Pages/MandatoryDisclosurePage"));
const NoticeViewAll = lazy(() => import("./Pages/NoticeViewAll"));

function App() {
  // Apply the dashboard-managed favicon once it's fetched.
  useSiteSettings();

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* =================== STATIC =================== */}
        <Route path="/" element={<PageView />} />

        {/* VIEW ALL pages for the home BULLETIN / ANNOUNCEMENTS sections */}
        <Route path="/bulletin" element={<NoticeViewAll type="bulletins" />} />
        <Route
          path="/announcements"
          element={<NoticeViewAll type="announcements" />}
        />

        {/* =================== PROGRAMS =================== */}
        <Route
          path="/:college/programs/:category"
          element={<SubPrograms />}
        />
        <Route
          path="/:college/programs"
          element={<SubPrograms />}
        />
        <Route
          path="/programs/:slug"
          element={<HeadPrograms />}
        />

        {/* =================== DEPARTMENTS =================== */}
        <Route
          path="/:college/departments/:deptSlug"
          element={<DepartmentsSubpage />}
        />

        {/* =================== MANDATORY DISCLOSURE (isolated, college-scoped) =================== */}
        <Route
          path={mandatoryDisclosureConfig.deepRoutePattern}
          element={<MandatoryDisclosurePage />}
        />
        <Route
          path={mandatoryDisclosureConfig.nestedRoutePattern}
          element={<MandatoryDisclosurePage />}
        />
        <Route
          path={mandatoryDisclosureConfig.routePattern}
          element={<MandatoryDisclosurePage />}
        />

        {/* =================== NESTED PAGE (under a micro page) ===================
            Nested pages are dependent on their parent micro page, so they live
            at the full /{college}/{micro-page}/{nested-page} depth. Fully
            dynamic, so the static 3-segment routes above (programs / departments
            / mandatory-disclosure) still win by specificity. */}
        <Route path="/:college/:page/:nested" element={<PageView />} />

        {/* =================== MICROPAGE / CTA =================== */}
        <Route path="/:college/:page" element={<PageView />} />

        {/* =================== NORMAL SLUG =================== */}
        <Route path="/:slug" element={<PageView />} />
      </Routes>
      </Suspense>

      <Footer />
      <NiaaChatbot />
      <HomePopup />
    </>
  );
}

export default App;
