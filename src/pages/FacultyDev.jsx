import OptimizedImage from "../components/OptimizedImage.jsx";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/MotionPrimitives";
import "./FacultyDev.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

export default function FacultyDev() {
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
          <h1>Faculty Development Activities</h1>
          <p>
            Empowering our faculty with the latest tools, technologies, and
            methodologies to foster academic excellence.
          </p>
        </motion.div>
      </section>

      {/* About */}
      <section className="fda-about">
        <ScrollReveal>
          <h2>About Faculty Development</h2>
        </ScrollReveal>

        <ScrollReveal className="about-row">
          <div className="about-row-text">
            <p>
              Faculty Development Activities (FDAs) at CHRIST (Deemed to be
              University), Department of Computer Science and Engineering, are
              designed to enhance teaching, research, and professional skills.
            </p>
          </div>
          <div className="about-row-img">
            <OptimizedImage
              src="/assets/overviewcomputer.jpg"
              alt="Faculty Workshop"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal className="about-row reverse" delay={0.05}>
          <div className="about-row-text">
            <p>
              These programs expose faculty members to the latest developments
              in Artificial Intelligence, Machine Learning, Cloud Computing, and
              other emerging areas.
            </p>
          </div>
          <div className="about-row-img">
            <OptimizedImage src="/assets/abstract.jpg" alt="Faculty Training" />
          </div>
        </ScrollReveal>

        <ScrollReveal className="about-row" delay={0.05}>
          <div className="about-row-text">
            <p>
              Through workshops, seminars, and training sessions, our faculty
              gain practical knowledge, connect with industry leaders, and
              evolve into more effective educators and researchers.
            </p>
          </div>
          <div className="about-row-img">
            <OptimizedImage src="/assets/sinoer.webp" alt="Faculty Seminar" />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="fda-highlight">
            "Strong faculty build strong students – development begins with
            continuous learning."
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
