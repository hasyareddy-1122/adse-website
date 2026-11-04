import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ServiceLearning.css";
import { getApiUrl } from "../lib/api.js";

import service1Img from "../assets/service1.jpg";
import service2Img from "../assets/service2.jpg";
import service3Img from "../assets/service3.jpg";
import service4Img from "../assets/service4.jpg";
import service5Img from "../assets/service5.png";
import service6Img from "../assets/service6.jpg";
import service7Img from "../assets/service7.jpg";
import serviceBannerImg from "../assets/servicebanner.jpg";
import serviceBanner1Img from "../assets/servicebanner1.jpg";
import serviceBanner2Img from "../assets/servicebanner2.jpg";

const NEWSLETTERS = [
  {
    title: "Kusuri Mane",
    subtitle: "Bengaluru",
    description:
      "Kusuri Mane is a marketplace for handmade, homemade, fresh-made, local-made, and also rural-made products.",
    image: service1Img,
  },
  {
    title: "Janapada Loka",
    subtitle: "Ramanagara",
    description:
      "This has become quite popular among tourists as it offers an excellent opportunity to observe the myriad folk art of Karnataka and as well as internalize the Heritage and Culture of the state.",
    image: service2Img,
  },
  {
    title: "Jungle Lodges and Resorts",
    subtitle: "Bengaluru",
    description:
      "It boasts of numerous sights of natural beauty along with an impressive amount of flora and fauna. Charming grasslands, dense forests, and glistening rivers are a common sight in the state.",
    image: service3Img,
  },
  {
    title: "Ride for Cause",
    subtitle: "Bengaluru",
    description:
      "It is a non-profit organization in India dedicated to helping underprivileged children reach their full potential—physically, mentally, and emotionally.",
    image: service4Img,
  },
  {
    title: "Uthishta",
    subtitle: "Bengaluru",
    description:
      "Uthishta is a committed non-profit organization that works towards uplifting and empowering underserved communities through transformative initiatives.",
    image: service5Img,
  },
  {
    title: "Saahas Zero Waste",
    subtitle: "Bengaluru",
    description:
      "Saahas Waste Management Pvt Ltd, a socio-environmental enterprise also known as Saahas Zero Waste, provides end-to-end waste management services.",
    image: service6Img,
  },
  {
    title: "Grama Shilpi",
    subtitle: "Hubballi",
    description:
      "Skill upgradation to existing artisans and training to new generation artisans. Diversifying artisan products to meet eco-friendly demand.",
    image: service7Img,
  },
];

export default function ServiceLearning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedProjects, setSavedProjects] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
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
            <div className="sl-hero-text">
              <h1>DEPARTMENT OF AI ML &amp; DS</h1>
            </div>
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
          <img
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
        <h2>About Service Learning</h2>

        <div className="sl-row">
          <div className="sl-text">
            <p>
              Students apply classroom knowledge to solve practical problems in
              the community, such as developing apps, building websites, or
              automating processes for nonprofits.
            </p>
          </div>
          <div className="sl-image">
            <img src={serviceBannerImg} alt="Service Learning 1" />
          </div>
        </div>

        <div className="sl-row reverse">
          <div className="sl-text">
            <p>
              Working on service projects encourages teamwork, communication,
              and creative problem-solving in real-world, multidisciplinary
              contexts.
            </p>
          </div>
          <div className="sl-image">
            <img src={serviceBanner1Img} alt="Service Learning 2" />
          </div>
        </div>

        <div className="sl-row">
          <div className="sl-text">
            <p>
              Students gain awareness of societal challenges while developing
              ethical, civic-minded perspectives and professional skills valued
              in their careers.
            </p>
          </div>
          <div className="sl-image">
            <img src={serviceBanner2Img} alt="Service Learning 3" />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <main className="sl-container">
        <h1 className="sl-page-title">Our Service Learning Partners</h1>

        <section className="sl-newsletter-wrapper">
          <div className="sl-newsletter-grid">
            {projectsLoading ? (
              <p>Loading Service Learning projects...</p>
            ) : (
              <>
                {paginatedList.map((project, idx) => (
                  <article
                    className="sl-newsletter-card"
                    key={project.id ?? `${project.title ?? "project"}-${idx}`}>
                    {project.image && (
                      <div className="sl-card-image">
                        <img
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

                      <p className="sl-card-desc">
                        {project.description || ""}
                      </p>
                    </div>
                  </article>
                ))}

                {paginatedList.length === 0 && (
                  <p>No Service Learning projects found.</p>
                )}
              </>
            )}
          </div>
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

      <Footer />
    </div>
  );
}
