import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { PageTransition } from "./components/MotionPrimitives";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Newsletter from "./pages/Newsletter";
import Caads from "./pages/Caads";
import FacultyDev from "./pages/FacultyDev";
import IndustrialVisit from "./pages/IndustrialVisit";
import ServiceLearning from "./pages/ServiceLearning";
import FacultyDetail from "./pages/FacultyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import DepartmentEvents from "./pages/DepartmentEvents";
import EventDetail from "./pages/EventDetail";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutUs />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <ContactUs />
              </PageTransition>
            }
          />
          <Route
            path="/newsletter"
            element={
              <PageTransition>
                <Newsletter />
              </PageTransition>
            }
          />
          <Route
            path="/caads"
            element={
              <PageTransition>
                <Caads />
              </PageTransition>
            }
          />
          <Route
            path="/faculty-dev"
            element={
              <PageTransition>
                <FacultyDev />
              </PageTransition>
            }
          />
          <Route
            path="/industrial-visit"
            element={
              <PageTransition>
                <IndustrialVisit />
              </PageTransition>
            }
          />
          <Route
            path="/service-learning"
            element={
              <PageTransition>
                <ServiceLearning />
              </PageTransition>
            }
          />
          <Route
            path="/faculty"
            element={
              <PageTransition>
                <FacultyDetail />
              </PageTransition>
            }
          />
          <Route
            path="/department-events"
            element={
              <PageTransition>
                <DepartmentEvents />
              </PageTransition>
            }
          />
          <Route
            path="/event/:id"
            element={
              <PageTransition>
                <EventDetail />
              </PageTransition>
            }
          />
          <Route
            path="/event:id"
            element={
              <PageTransition>
                <EventDetail />
              </PageTransition>
            }
          />

          {/* Auth + portal */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/accept-invite"
            element={
              <PageTransition>
                <AcceptInvite />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
