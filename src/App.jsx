import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { PageTransition } from "./components/MotionPrimitives";
import { apiRequest, getStoredUser, isLoggedIn, logout } from "./lib/api.js";
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
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import DepartmentEvents from "./pages/DepartmentEvents";
import EventDetail from "./pages/EventDetail";

const ALLOWED_ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const storedUser = getStoredUser();
      if (
        !isLoggedIn() ||
        !storedUser ||
        !ALLOWED_ADMIN_ROLES.has(storedUser.role)
      ) {
        logout();
        if (!cancelled) setStatus("denied");
        return;
      }

      try {
        const data = await apiRequest("/api/auth/me");
        if (!data?.user || !ALLOWED_ADMIN_ROLES.has(data.user.role)) {
          logout();
          if (!cancelled) setStatus("denied");
          return;
        }
        if (!cancelled) setStatus("allowed");
      } catch {
        logout();
        if (!cancelled) setStatus("denied");
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
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

          {/* Private Admin Auth + Protected Dashboard */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route path="/register" element={<Navigate to="/" replace />} />
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
              <ProtectedAdminRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
