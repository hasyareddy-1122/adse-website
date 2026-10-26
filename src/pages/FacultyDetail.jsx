import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getApiUrl } from "../lib/api";
import "./FacultyDetail.css";

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
        const response = await fetch(getApiUrl(`/api/faculties/${id}`), {
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load faculty details.");
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

  const academicLinks = [
    { label: "ResearchGate", url: faculty?.researchGate },
    { label: "Google Scholar", url: faculty?.googleScholar },
    { label: "ORCID", url: faculty?.orcid },
    { label: "Website", url: faculty?.website },
  ].filter((item) => typeof item.url === "string" && item.url.trim());

  return (
    <div className="fd-page">
      <Navbar />

      <section className="fd-hero-section">
        <h1>Faculty Details</h1>
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
          <div className="fd-faculty-details">
            <div className="fd-faculty-left">
              {faculty.image && (
                <img
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
            </div>

            <div className="fd-faculty-right">
              <h2>{faculty.name}</h2>

              {faculty.designation && (
                <p>
                  <strong>Designation:</strong> {faculty.designation}
                </p>
              )}

              {faculty.specialization && (
                <p>
                  <strong>Specialization:</strong> {faculty.specialization}
                </p>
              )}

              {faculty.department && (
                <p>
                  <strong>Department:</strong> {faculty.department}
                </p>
              )}

              {faculty.cabinLocation && (
                <p>
                  <strong>Cabin Location:</strong> {faculty.cabinLocation}
                </p>
              )}

              {faculty.qualification && (
                <p>
                  <strong>Qualification:</strong> {faculty.qualification}
                </p>
              )}

              {faculty.bio && (
                <p>
                  <strong>About:</strong> {faculty.bio}
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

              {academicLinks.length > 0 && (
                <div className="fd-btns">
                  {academicLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer">
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
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
