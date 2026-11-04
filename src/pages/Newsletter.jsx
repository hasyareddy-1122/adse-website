import { useEffect, useState } from "react";
import { getApiUrl } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Newsletter.css";

const CARDS = [
  {
    id: 1,
    category: "Research",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/8d6239f675ff88f6a04a34d363fbfa1a06f737b8?placeholderIfAbsent=true",
    alt: "AI Research Breakthroughs",
    date: "September 2023",
    title: "AI Research Breakthroughs –",
    subtitle: "Q3 2023",
    desc: "Highlights of the latest AI research from our department, including advancements in natural language…",
  },
  {
    id: 2,
    category: "Student",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/365f470526f20a4af61accb8c07af8e5387edccc?placeholderIfAbsent=true",
    alt: "Student Achievements",
    date: "August 2023",
    title: "Student Achievements –",
    subtitle: "Summer 2023",
    desc: "Celebrating our students' achievements in hackathons, competitions, and internships.",
  },
  {
    id: 3,
    category: "Faculty",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/b3c70e0150c3e5e77394135366e552797054c054?placeholderIfAbsent=true",
    alt: "Faculty Publications",
    date: "July 2023",
    title: "Faculty Publications",
    subtitle: "Round‑up",
    desc: "Recent publications by our faculty members in prestigious journals and conferences around the world.",
  },
  {
    id: 4,
    category: "Industry",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/4f1d0054e0177d1078c1494346c8b523128dc66c?placeholderIfAbsent=true",
    alt: "Industry Collaboration",
    date: "June 2023",
    title: "Industry Collaboration",
    subtitle: "Update",
    desc: "Updates on our ongoing collaborations with industry partners and new partnerships.",
  },
  {
    id: 5,
    category: "General",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/9beb73f0f9a970a7fd444113caa465cead0d9e15?placeholderIfAbsent=true",
    alt: "Department Newsletter",
    date: "May 2023",
    title: "Department Newsletter –",
    subtitle: "Spring 2023",
    desc: "General updates from the department including curriculum changes, new faculty members, and more.",
  },
  {
    id: 6,
    category: "Research",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/74b003c47069f3e425c0bd122f403590cdcfb5a6?placeholderIfAbsent=true",
    alt: "Research Seminar Series",
    date: "April 2023",
    title: "Research Seminar Series",
    subtitle: "Recap",
    desc: "Summary of the spring research seminar series featuring guest speakers from academia.",
  },
];

const SIDEBAR_FALLBACK = [
  {
    id: 7,
    category: "Student",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/1d4a5a72744a5ddccc7293644026b1dc051fd928?placeholderIfAbsent=true",
    alt: "Graduation Experiences",
    date: "August 2025",
    title: "Graduation Experiences",
    desc: "Students reflect on graduation, job markets, and future paths.",
  },
  {
    id: 8,
    category: "Research",
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/df0266deb3c86c44a7a76e0385a1df201f576798?placeholderIfAbsent=true",
    alt: "Neurofluence 2024",
    date: "April 2023",
    title: "Neurofluence 2024 VOLUME 7 ISSUE 1",
    desc: "Overview of talks given in the latest Neurofluence seminar series.",
  },
];

const FILTERS = [
  "All",
  "Research",
  "Student",
  "Faculty",
  "Industry",
  "General",
];
const DATE_ICON =
  "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/0a98619b487a17d682c1f56e2821a305d27bc50c?placeholderIfAbsent=true";
const PDF_ICON =
  "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/703a1e6643cb90f767671c99b2020d1477e39c5b?placeholderIfAbsent=true";
const SEARCH_ICON =
  "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/2cef4ee11033eecb4a19ef2637573b4246bf4c9b?placeholderIfAbsent=true";

export default function Newsletter() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCards, setSavedCards] = useState(null);
  const [savedSidebar, setSavedSidebar] = useState(null);
  const [savedFeatured, setSavedFeatured] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNewsletterContent() {
      try {
        const response = await fetch(getApiUrl("/api/content"));
        if (!response.ok) {
          throw new Error(
            `Newsletter content request failed (${response.status}).`,
          );
        }

        const data = await response.json();
        const content = data?.content ?? {};

        if (cancelled) return;

        if (Array.isArray(content["newsletter.cards"])) {
          setSavedCards(content["newsletter.cards"]);
        }

        if (Array.isArray(content["newsletter.sidebar"])) {
          setSavedSidebar(content["newsletter.sidebar"]);
        }

        if (
          content["newsletter.featured"] &&
          typeof content["newsletter.featured"] === "object" &&
          !Array.isArray(content["newsletter.featured"])
        ) {
          setSavedFeatured(content["newsletter.featured"]);
        }
      } catch (error) {
        console.error("Failed to load newsletter content:", error);
      }
    }

    loadNewsletterContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayCards = savedCards ?? CARDS;
  const displaySidebar = savedSidebar ?? SIDEBAR_FALLBACK;
  const featured = savedFeatured ?? {
    title: "Empowering Youth through NCC and Academic Stewardship",
    paragraphs: [
      "In this photograph, we proudly see a distinguished group representing the National Cadet Corps (NCC) of CHRIST (Deemed to be University), Bangalore Kengeri Campus, captured during a formal occasion reflecting excellence and discipline.",
      "Notably, standing at the far right is Professor Dr. Micheal Moses T, the Head of the Department of Computer Science and Engineering (CSE). His presence alongside the cadets underscores his active involvement in both academic and co-curricular leadership, and his continued support for student development initiatives such as NCC.",
      "His guidance and encouragement have played a vital role in nurturing a culture of integrity, discipline, and holistic growth within the department.",
    ],
    img: "https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/3ef6e3b9be263448b4ceadbbcd0811abc01335cc?placeholderIfAbsent=true",
    alt: "NCC Group with Professor Dr. Micheal Moses T",
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredCards = displayCards.filter((card) => {
    const category =
      typeof card.category === "string" ? card.category : "General";
    const title = typeof card.title === "string" ? card.title : "";
    const desc = typeof card.desc === "string" ? card.desc : "";
    const matchCat = activeFilter === "All" || category === activeFilter;
    const matchSearch =
      title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  return (
    <div className="newsletter-page">
      <Navbar />

      {/* Hero video */}
      <section className="nl-hero">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src="/assets/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-text-nl">Welcome Christite</div>
      </section>

      {/* Filter */}
      <section
        className="nl-filter-section filter-bar"
        style={{ marginLeft: "auto", marginRight: "auto" }}>
        <div className="nl-filters">
          <span className="filter-label">Filter&nbsp;by:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="search-box nl-search-box">
          <img src={SEARCH_ICON} alt="Search icon" />
          <input
            type="text"
            placeholder="Search newsletters…"
            aria-label="Search newsletters"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <main className="nl-container">
        <h1 className="page-title">EXPLORE NEWSLETTERS</h1>

        <section className="newsletter-wrapper">
          <div className="newsletter-grid">
            {filteredCards.map((card) => (
              <article
                className="newsletter-card"
                key={card.id}
                data-category={card.category}>
                <img src={card.img} alt={card.alt} />
                <div className="card-body">
                  <div className="card-meta">
                    <span className="date">
                      <img src={DATE_ICON} alt="" />
                      {card.date}
                    </span>
                    <span className="category">{card.category}</span>
                  </div>
                  <h3 className="card-title">{card.title}</h3>
                  <h4 className="card-subtitle">{card.subtitle}</h4>
                  <p className="card-desc">{card.desc}</p>
                  <div className="card-footer">
                    {card.readMore ? (
                      <a
                        href={card.readMore}
                        className="nl-read-more"
                        target="_blank"
                        rel="noopener noreferrer">
                        Read More
                      </a>
                    ) : (
                      <span className="nl-read-more" aria-disabled="true">
                        Read More
                      </span>
                    )}

                    {card.downloadPdf ? (
                      <a
                        href={card.downloadPdf}
                        className="pdf"
                        target="_blank"
                        rel="noopener noreferrer">
                        <img src={PDF_ICON} alt="" />
                        PDF
                      </a>
                    ) : (
                      <span className="pdf" aria-disabled="true">
                        <img src={PDF_ICON} alt="" />
                        PDF
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="newsletter-sidebar">
            {displaySidebar.map((card, index) => (
              <article
                className="newsletter-card"
                key={card.id ?? `${card.title ?? "sidebar"}-${index}`}
                data-category={card.category}>
                <img src={card.img} alt={card.alt} />
                <div className="card-body">
                  <div className="card-meta">
                    <span className="date">
                      <img src={DATE_ICON} alt="" />
                      {card.date}
                    </span>
                    <span className="category">{card.category}</span>
                  </div>
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-desc">{card.desc}</p>
                </div>
              </article>
            ))}
          </aside>
        </section>

        {/* Featured */}
        <section className="featured-section">
          <div className="featured-text">
            <h2>{featured.title || "Featured Newsletter"}</h2>
            {Array.isArray(featured.paragraphs) &&
              featured.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
          <div className="featured-image">
            {featured.img && (
              <img
                src={featured.img}
                alt={featured.alt || featured.title || "Featured newsletter"}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
