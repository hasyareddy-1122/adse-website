import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "../components/OptimizedImage.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal, MotionButton } from "../components/MotionPrimitives";
import { getApiUrl } from "../lib/api.js";
import "./IndustrialVisit.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

const DEFAULT_INDUSTRIAL_VISIT = {
  title: "Industrial Visit",
  subtitle:
    "Exploring industries, gaining real-world knowledge, and bridging the gap between classroom and workplace.",
  aboutHeading: "About Our Department Industrial Visits",
  rows: [
    {
      text: "At CHRIST (Deemed to be University), Department of AI, ML and Data Science, Industrial Visits are an integral part of our academic curriculum. They offer students a unique opportunity to witness practical applications of theoretical concepts learned in classrooms.",
      image: "/assets/industrial1.jpg",
      alt: "Industrial Visit 1",
    },
    {
      text: "Through these visits, students interact with industry experts, observe real-time processes, and understand emerging technologies shaping the future. Such experiences not only enhance their technical knowledge but also build teamwork, communication, and problem-solving skills.",
      image: "/assets/industrial2.jpg",
      alt: "Industrial Visit 2",
    },
    {
      text: "Each year, our department organizes visits to leading IT companies, research centers, and tech hubs, enabling our students to stay aligned with industry trends and expectations.",
      image: "/assets/industrial3.jpg",
      alt: "Industrial Visit 3",
    },
  ],
  highlight:
    '"Learning beyond the classroom – Industrial Visits prepare our students for tomorrow\'s challenges."',
  visitsHeading: "Our Industrial Visits",
  visits: [
    {
      title: "Industrial Visit to Infosys, Mysore",
      description:
        "Our students had the opportunity to visit Infosys Campus, Mysore – one of the largest corporate training centers in the world. The visit provided deep insights into industry culture, modern training methodologies, and emerging IT practices that bridge the gap between academics and corporate exposure.",
      image: "/assets/Infosys_Mysore.jpg",
      alt: "Infosys Mysore Visit",
      link: "",
    },
  ],
};

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getApiUrl(url.startsWith("/") ? url : `/${url}`);
}

export default function IndustrialVisit() {
  const [data, setData] = useState(DEFAULT_INDUSTRIAL_VISIT);

  useEffect(() => {
    let cancelled = false;

    async function loadIndustrialVisitContent() {
      try {
        const res = await fetch(getApiUrl("/api/content"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const saved = json?.content?.["industrial-visit.content"];
        if (
          cancelled ||
          !saved ||
          typeof saved !== "object" ||
          Array.isArray(saved)
        ) {
          return;
        }

        setData({
          title: saved.title || DEFAULT_INDUSTRIAL_VISIT.title,
          subtitle: saved.subtitle || DEFAULT_INDUSTRIAL_VISIT.subtitle,
          aboutHeading:
            saved.aboutHeading || DEFAULT_INDUSTRIAL_VISIT.aboutHeading,
          rows:
            Array.isArray(saved.rows) && saved.rows.length > 0
              ? saved.rows
              : DEFAULT_INDUSTRIAL_VISIT.rows,
          highlight:
            saved.highlight !== undefined
              ? saved.highlight
              : DEFAULT_INDUSTRIAL_VISIT.highlight,
          visitsHeading:
            saved.visitsHeading || DEFAULT_INDUSTRIAL_VISIT.visitsHeading,
          visits:
            Array.isArray(saved.visits) && saved.visits.length > 0
              ? saved.visits
              : DEFAULT_INDUSTRIAL_VISIT.visits,
        });
      } catch (err) {
        console.error("Failed to load Industrial Visit dynamic content:", err);
      }
    }

    loadIndustrialVisitContent();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="iv-page">
      <Navbar />

      {/* Hero */}
      <section className="iv-hero">
        <motion.div
          className="iv-hero-content"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: HERO_EASE }}>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </motion.div>
      </section>

      {/* About */}
      <section className="iv-about">
        <ScrollReveal>
          <h2>{data.aboutHeading}</h2>
        </ScrollReveal>

        {data.rows.map((row, idx) => (
          <ScrollReveal
            key={idx}
            className={`iv-row${idx % 2 === 1 ? " reverse" : ""}`}
            delay={idx === 0 ? 0 : 0.05}>
            <div className="iv-text">
              <p>{row.text}</p>
            </div>
            {row.image && (
              <div className="iv-image">
                <OptimizedImage
                  src={resolveMediaUrl(row.image)}
                  alt={row.alt || `Industrial Visit ${idx + 1}`}
                />
              </div>
            )}
          </ScrollReveal>
        ))}

        {data.highlight && (
          <ScrollReveal>
            <div className="iv-highlight">{data.highlight}</div>
          </ScrollReveal>
        )}
      </section>

      {/* Industrial Visits */}
      <section className="industrial-visits">
        <ScrollReveal>
          <h2>{data.visitsHeading}</h2>
          {data.visits.map((visit, idx) => (
            <div className="visit-card" key={visit.id ?? idx}>
              {visit.image && (
                <OptimizedImage
                  src={resolveMediaUrl(visit.image)}
                  alt={visit.alt || visit.title || "Industrial Visit"}
                />
              )}
              <div className="visit-content">
                <h3>{visit.title}</h3>
                <p>{visit.description}</p>
                {visit.link ? (
                  <MotionButton>
                    <a
                      href={visit.link}
                      className="iv-read-more"
                      target={
                        /^https?:\/\//i.test(visit.link) ? "_blank" : undefined
                      }
                      rel={
                        /^https?:\/\//i.test(visit.link)
                          ? "noopener noreferrer"
                          : undefined
                      }>
                      Read More →
                    </a>
                  </MotionButton>
                ) : null}
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
