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
import "./Caads.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

const DEFAULT_CAADS = {
  title: "CAADS",
  subtitle:
    "Christ Association of AIML & DS Students – where innovation meets collaboration.",
  rows: [
    {
      text: "The C for AIML & Data Science (CAADS) at CHRIST (Deemed to be University) is a hub for innovation, research, and academic excellence in the fields of Artificial Intelligence and Data Science. It serves as a bridge between theory and practice, enabling students and faculty to work on cutting-edge projects, workshops, and industry collaborations.",
      image: "/assets/caads1.jpg",
      alt: "CAADS Overview",
    },
    {
      text: "CAADS regularly organizes seminars, industrial visits, hackathons, and hands-on training sessions where students gain exposure to real-world applications of AI and DS. The center actively encourages participation in research publications, competitions, and interdisciplinary projects that shape the future of intelligent systems.",
      image: "/assets/caads2.jpg",
      alt: "CAADS Workshop",
    },
    {
      text: "Through its dedicated team of faculty mentors and student committees, CAADS nurtures creativity, problem-solving, and leadership. It also establishes strong connections with leading industries, research organizations, and academic institutions, providing students with invaluable exposure and opportunities.",
      image: "/assets/caads3.jpg",
      alt: "CAADS Students",
    },
  ],
  quote:
    '"CAADS is more than just a center – it is a vision for empowering students with knowledge, innovation, and the spirit of discovery."',
};

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getApiUrl(url.startsWith("/") ? url : `/${url}`);
}

export default function Caads() {
  const [data, setData] = useState(DEFAULT_CAADS);
  const [seminars, setSeminars] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCaadsContent() {
      try {
        const res = await fetch(getApiUrl("/api/content"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const content = json?.content ?? {};
        if (cancelled) return;

        const saved = content["caads.content"];
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
          setData({
            title: saved.title || DEFAULT_CAADS.title,
            subtitle: saved.subtitle || DEFAULT_CAADS.subtitle,
            rows:
              Array.isArray(saved.rows) && saved.rows.length > 0
                ? saved.rows
                : DEFAULT_CAADS.rows,
            quote: saved.quote || DEFAULT_CAADS.quote,
          });
        }

        if (Array.isArray(content["seminars.items"])) {
          setSeminars(content["seminars.items"]);
        }
      } catch (err) {
        console.error("Failed to load CAADS dynamic content:", err);
      }
    }

    loadCaadsContent();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="caads-page">
      <Navbar />

      {/* Hero */}
      <section className="caads-hero">
        <motion.div
          className="caads-hero-content"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: HERO_EASE }}>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </motion.div>
      </section>

      {/* About CAADS */}
      <section className="about-caads-section">
        <ScrollReveal>
          <h2>
            About <span>{data.title}</span>
          </h2>
        </ScrollReveal>

        {data.rows.map((row, idx) => (
          <ScrollReveal
            key={idx}
            className={`caads-row${idx % 2 === 1 ? " reverse" : ""}`}
            delay={idx === 0 ? 0 : 0.05}>
            <div className="caads-row-text">
              <p>{row.text}</p>
            </div>
            {row.image && (
              <div className="caads-row-img">
                <OptimizedImage
                  src={resolveMediaUrl(row.image)}
                  alt={row.alt || `${data.title} highlight ${idx + 1}`}
                />
              </div>
            )}
          </ScrollReveal>
        ))}

        {seminars.length > 0 && (
          <section style={{ marginTop: "40px" }}>
            <ScrollReveal>
              <h2>Seminars &amp; Technical Sessions</h2>
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

        {data.quote && (
          <ScrollReveal>
            <p className="caads-quote">{data.quote}</p>
          </ScrollReveal>
        )}
      </section>

      <Footer />
    </div>
  );
}
