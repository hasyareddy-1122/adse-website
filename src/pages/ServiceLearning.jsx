import OptimizedImage from "../components/OptimizedImage.jsx";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerGrid,
  StaggerItem,
} from "../components/MotionPrimitives";
import "./ServiceLearning.css";
import { getApiUrl } from "../lib/api.js";

import serviceBannerImg from "../assets/servicebanner.jpg";
import serviceBannerImgAvif from "../assets/servicebanner.avif";
import serviceBanner1Img from "../assets/servicebanner1.jpg";
import serviceBanner1ImgAvif from "../assets/servicebanner1.avif";
import serviceBanner2Img from "../assets/servicebanner2.jpg";
import serviceBanner2ImgAvif from "../assets/servicebanner2.avif";

const HERO_EASE = [0.22, 1, 0.36, 1];

export default function ServiceLearning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedProjects, setSavedProjects] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const itemsPerPage = 16;

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const response = await fetch(getApiUrl("/api/content"));

        if (!response.ok) {
          throw new Error(
            `Failed to load Service Learning content: ${response.status}`,
          );
        }

        const data = await response.json();
        const projects = data?.content?.["service-learning.projects"];

        if (!cancelled && Array.isArray(projects)) {
          setSavedProjects(projects);
        }
      } catch (error) {
        console.error("Failed to load Service Learning projects:", error);
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  const displayProjects = savedProjects ?? [];

  const filteredList = displayProjects.filter((project) =>
    (project.title || "")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(start, start + itemsPerPage);

  return (
    <div className="sl-page">
      <Navbar />

      {/* Hero Section */}
      <section className="sl-hero-section">
        <div className="sl-hero-inner">
          <div className="sl-hero-content">
            <motion.div
              className="sl-hero-text"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: HERO_EASE }}>
              <h1>DEPARTMENT OF AI ML &amp; DS</h1>
            </motion.div>
          </div>
          <div className="sl-hero-spline-wrapper">
            <div className="sl-hero-spline">
              <iframe
                src="https://my.spline.design/nexbotrobotcharacterconcept-AvOzoPLnXD7ff93O50ATgDlu/"
                frameBorder="0"
                className="sl-spline-iframe"
                title="Nexbot Robot Character Concept"></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="sl-filter-section">
        <div className="search-box sl-search-box">
          <OptimizedImage
            src="https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/2cef4ee11033eecb4a19ef2637573b4246bf4c9b"
            alt="Search icon"
          />
          <input
            type="text"
            placeholder="Search projects…"
            aria-label="Search projects"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="sl-section">
        <ScrollReveal>
          <h2>About Service Learning</h2>
        </ScrollReveal>

        <ScrollReveal className="sl-row">
          <div className="sl-text">
            <p>
              Students apply classroom knowledge to solve practical problems in
              the community, such as developing apps, building websites, or
              automating processes for nonprofits.
            </p>
          </div>
          <div className="sl-image">
            <OptimizedImage
              src={serviceBannerImg}
              alt="Service Learning 1"
              avifSrc={serviceBannerImgAvif}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal className="sl-row reverse" delay={0.05}>
          <div className="sl-text">
            <p>
              Working on service projects encourages teamwork, communication,
              and creative problem-solving in real-world, multidisciplinary
              contexts.
            </p>
          </div>
          <div className="sl-image">
            <OptimizedImage
              src={serviceBanner1Img}
              alt="Service Learning 2"
              avifSrc={serviceBanner1ImgAvif}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal className="sl-row" delay={0.05}>
          <div className="sl-text">
            <p>
              Students gain awareness of societal challenges while developing
              ethical, civic-minded perspectives and professional skills valued
              in their careers.
            </p>
          </div>
          <div className="sl-image">
            <OptimizedImage
              src={serviceBanner2Img}
              alt="Service Learning 3"
              avifSrc={serviceBanner2ImgAvif}
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Partners Section */}
      <main className="sl-container">
        <ScrollReveal>
          <h1 className="sl-page-title">Our Service Learning Partners</h1>
        </ScrollReveal>

        <section className="sl-newsletter-wrapper">
          {projectsLoading ? (
            <div className="sl-newsletter-grid">
              <p>Loading Service Learning projects...</p>
            </div>
          ) : paginatedList.length === 0 ? (
            <div className="sl-newsletter-grid">
              <p>No Service Learning projects found.</p>
            </div>
          ) : (
            <StaggerGrid
              key={`${currentPage}-${searchQuery}`}
              className="sl-newsletter-grid"
              stagger={0.05}>
              {paginatedList.map((project, idx) => (
                <StaggerItem
                  key={project.id ?? `${project.title ?? "project"}-${idx}`}>
                  <article
                    className="sl-newsletter-card sl-card-clickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProject(project)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProject(project);
                      }
                    }}>
                    {project.image && (
                      <div className="sl-card-image">
                        <OptimizedImage
                          src={project.image}
                          alt={project.title || "Service Learning project"}
                        />
                      </div>
                    )}

                    <div className="sl-card-body">
                      <h3 className="sl-card-title">
                        {project.title || "Untitled project"}
                      </h3>

                      {project.subtitle && (
                        <h4 className="sl-card-subtitle">{project.subtitle}</h4>
                      )}

                      <span className="sl-card-cta">View Details →</span>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </section>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}>
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </main>

      {/* Project Details Popup */}
      {selectedProject && (
        <div
          className="modal open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sl-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
            }
          }}>
          <div className="modal-content sl-project-modal">
            <button
              type="button"
              className="close-btn"
              aria-label="Close project details"
              onClick={() => setSelectedProject(null)}>
              &times;
            </button>

            <h2 id="sl-modal-title">
              {selectedProject.title || "Untitled project"}
            </h2>

            {selectedProject.subtitle && (
              <p className="sl-modal-subtitle">{selectedProject.subtitle}</p>
            )}

            <p className="sl-modal-desc">
              {selectedProject.description || "No description provided."}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}