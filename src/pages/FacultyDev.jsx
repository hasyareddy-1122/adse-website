import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "../components/OptimizedImage.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerGrid,
  StaggerItem,
} from "../components/MotionPrimitives";
import { getApiUrl } from "../lib/api.js";
import "./FacultyDev.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

const DEFAULT_FDA = {
  title: "Faculty Development Activities",
  subtitle:
    "Empowering our faculty with the latest tools, technologies, and methodologies to foster academic excellence.",
  rows: [
    {
      text: "Faculty Development Activities (FDAs) at CHRIST (Deemed to be University), Department of AI, ML and Data Science, are designed to enhance teaching, research, and professional skills.",
      image: "/assets/overviewcomputer.jpg",
      alt: "Faculty Workshop",
    },
    {
      text: "These programs expose faculty members to the latest developments in Artificial Intelligence, Machine Learning, Cloud Computing, and other emerging areas.",
      image: "/assets/abstract.jpg",
      alt: "Faculty Training",
    },
    {
      text: "Through workshops, seminars, and training sessions, our faculty gain practical knowledge, connect with industry leaders, and evolve into more effective educators and researchers.",
      image: "/assets/sinoer.webp",
      alt: "Faculty Seminar",
    },
  ],
  highlight:
    '"Strong faculty build strong students – development begins with continuous learning."',
};

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getApiUrl(url.startsWith("/") ? url : `/${url}`);
}

export default function FacultyDev() {
  const [data, setData] = useState(DEFAULT_FDA);
  const [seminars, setSeminars] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadFdaContent() {
      try {
        const res = await fetch(getApiUrl("/api/content"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const content = json?.content ?? {};
        if (cancelled) return;

        const saved = content["faculty-dev.content"];
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          setData({
            title: saved.title || DEFAULT_FDA.title,
            subtitle: saved.subtitle || DEFAULT_FDA.subtitle,
            rows:
              Array.isArray(saved.rows) && saved.rows.length > 0
                ? saved.rows
                : DEFAULT_FDA.rows,
            highlight: saved.highlight || DEFAULT_FDA.highlight,
          });
        }

        if (Array.isArray(content["seminars.items"])) {
          setSeminars(content["seminars.items"]);
        }
      } catch (err) {
        console.error(
          "Failed to load Faculty Development dynamic content:",
          err,
        );
      }
    }

    loadFdaContent();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fda-page">
      <Navbar />

      {/* Hero */}
      <section className="fda-hero">
        <motion.div
          className="fda-hero-content"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: HERO_EASE }}>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </motion.div>
      </section>

      {/* About */}
      <section className="fda-about">
        <ScrollReveal>
          <h2>About Faculty Development</h2>
        </ScrollReveal>

        {data.rows.map((row, idx) => (
          <ScrollReveal
            key={idx}
            className={`about-row${idx % 2 === 1 ? " reverse" : ""}`}
            delay={idx === 0 ? 0 : 0.05}>
            <div className="about-row-text">
              <p>{row.text}</p>
            </div>
            {row.image && (
              <div className="about-row-img">
                <OptimizedImage
                  src={resolveMediaUrl(row.image)}
                  alt={row.alt || `Faculty Development ${idx + 1}`}
                />
              </div>
            )}
          </ScrollReveal>
        ))}

        {seminars.length > 0 && (
          <section style={{ marginTop: "40px" }}>
            <ScrollReveal>
              <h2>Seminars &amp; Faculty Sessions</h2>
            </ScrollReveal>
            <StaggerGrid className="events-list" stagger={0.06}>
              {seminars.map((item, idx) => (
                <StaggerItem key={item.id ?? idx}>
                  <article className="event">
                    <div className="event-details">
                      {item.image && (
                        <OptimizedImage
                          src={resolveMediaUrl(item.image)}
                          alt={item.title || "Seminar"}
                          style={{
                            width: "100%",
                            maxHeight: "240px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "12px",
                          }}
                        />
                      )}
                      <h3>{item.title || "Untitled Seminar"}</h3>
                      {item.speakerOrDate && (
                        <p>
                          <strong>Schedule / Speaker:</strong>{" "}
                          {item.speakerOrDate}
                        </p>
                      )}
                      {item.venue && (
                        <p>
                          <strong>Venue:</strong> {item.venue}
                        </p>
                      )}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </section>
        )}

        {data.highlight && (
          <ScrollReveal>
            <div className="fda-highlight">{data.highlight}</div>
          </ScrollReveal>
        )}
      </section>

      <Footer />
    </div>
  );
}
