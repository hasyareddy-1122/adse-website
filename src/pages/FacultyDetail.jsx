import OptimizedImage from "../components/OptimizedImage.jsx";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiRequest, getApiUrl } from "../lib/api";
import "./FacultyDetail.css";

const CARD_EASE = [0.22, 1, 0.36, 1];

export default function FacultyDetail() {
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get("id");
  const id = rawId ? Number(rawId) : NaN;

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFaculty() {
      setLoading(true);
      setError("");
      setFaculty(null);

      if (!Number.isInteger(id) || id < 1) {
        setError("Invalid faculty ID.");
        setLoading(false);
        return;
      }

      try {
        let payload;
        try {
          payload = await apiRequest(`/api/faculties/${id}`);
        } catch (err) {
          if (err?.status === 401) {
            const fallbackRes = await fetch(getApiUrl(`/api/faculties/${id}`), {
              cache: "no-store",
            });
            payload = await fallbackRes.json();
            if (!fallbackRes.ok) {
              throw new Error(
                payload?.error || "Unable to load faculty details.",
              );
            }
          } else {
            throw err;
          }
        }

        if (!cancelled) {
          setFaculty(payload?.faculty || null);
          if (!payload?.faculty) setError("Faculty not found.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load faculty details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFaculty();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const hasGoogleScholar =
    typeof faculty?.googleScholar === "string" && faculty.googleScholar.trim();

  return (
    <div className="fd-page">
      <Navbar />

      <section className="fd-hero-section">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: CARD_EASE }}>
          Faculty Details
        </motion.h1>
      </section>

      <div className="fd-faculty-wrapper">
        {loading ? (
          <div className="fd-faculty-details">
            <p>Loading faculty details…</p>
          </div>
        ) : error ? (
          <div className="fd-faculty-details">
            <p>{error}</p>
          </div>
        ) : faculty ? (
          <motion.div
            className="fd-faculty-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: CARD_EASE }}>
            <div className="fd-faculty-left">
              {faculty.image && (
                <OptimizedImage
                  src={
                    faculty.image.startsWith("http")
                      ? faculty.image
                      : `/${faculty.image.replace(/^\/+/, "")}`
                  }
                  alt={faculty.name || "Faculty"}
                />
              )}

              <h2>{faculty.name}</h2>
              {faculty.designation && <p>{faculty.designation}</p>}
            </div>

            <div className="fd-faculty-right">
              <h2>{faculty.name}</h2>

              {faculty.designation && (
                <p>
                  <strong>Designation:</strong> {faculty.designation}
                </p>
              )}

              {faculty.department && (
                <p>
                  <strong>Department:</strong> {faculty.department}
                </p>
              )}

              {faculty.specialization && (
                <p>
                  <strong>Specialization:</strong> {faculty.specialization}
                </p>
              )}

              {faculty.qualification && (
                <p>
                  <strong>Qualification:</strong> {faculty.qualification}
                </p>
              )}

              {(faculty.cabinLocation || faculty.locationRestricted) && (
                <p>
                  <strong>Campus / Cabin Location:</strong>{" "}
                  {faculty.cabinLocation || "Kengeri Campus"}
                  {faculty.locationRestricted && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.9rem",
                        color: "#555",
                        marginTop: "4px",
                      }}>
                      <Link
                        to="/login"
                        style={{
                          textDecoration: "underline",
                          fontWeight: 600,
                        }}>
                        Sign in
                      </Link>{" "}
                      with your university account to view exact cabin / room
                      details.
                    </span>
                  )}
                </p>
              )}

              {faculty.publicEmail && (
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${faculty.publicEmail}`}>
                    {faculty.publicEmail}
                  </a>
                </p>
              )}

              {hasGoogleScholar && (
                <div className="fd-btns">
                  <a
                    href={faculty.googleScholar}
                    target="_blank"
                    rel="noopener noreferrer">
                    Google Scholar
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="fd-faculty-details">
            <p>Faculty not found.</p>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <Link className="fd-back-btn" to="/#faculty">
            ← Back to Faculty List
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
