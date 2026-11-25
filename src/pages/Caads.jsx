import OptimizedImage from "../components/OptimizedImage.jsx";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/MotionPrimitives";
import "./Caads.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

export default function Caads() {
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
          <h1>CAADS</h1>
          <p>
            Christ Association of AIML &amp; DS Students – where innovation
            meets collaboration.
          </p>
        </motion.div>
      </section>

      {/* About CAADS */}
      <section className="about-caads-section">
        <ScrollReveal>
          <h2>
            About <span>CAADS</span>
          </h2>
        </ScrollReveal>

        {/* Row 1 */}
        <ScrollReveal className="caads-row">
          <div className="caads-row-text">
            <p>
              The <b>C for AIML &amp; Data Science (CAADS)</b> at CHRIST (Deemed
              to be University) is a hub for innovation, research, and academic
              excellence in the fields of Artificial Intelligence and Data
              Science. It serves as a bridge between theory and practice,
              enabling students and faculty to work on cutting-edge projects,
              workshops, and industry collaborations.
            </p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads1.jpg" alt="CAADS Overview" />
          </div>
        </ScrollReveal>

        {/* Row 2 */}
        <ScrollReveal className="caads-row reverse" delay={0.05}>
          <div className="caads-row-text">
            <p>
              CAADS regularly organizes{" "}
              <b>
                seminars, industrial visits, hackathons, and hands-on training
                sessions
              </b>{" "}
              where students gain exposure to real-world applications of AI and
              DS. The center actively encourages participation in research
              publications, competitions, and interdisciplinary projects that
              shape the future of intelligent systems.
            </p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads2.jpg" alt="CAADS Workshop" />
          </div>
        </ScrollReveal>

        {/* Row 3 */}
        <ScrollReveal className="caads-row" delay={0.05}>
          <div className="caads-row-text">
            <p>
              Through its dedicated team of{" "}
              <b>faculty mentors and student committees</b>, CAADS nurtures
              creativity, problem-solving, and leadership. It also establishes
              strong connections with leading industries, research
              organizations, and academic institutions, providing students with
              invaluable exposure and opportunities.
            </p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads3.jpg" alt="CAADS Students" />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="caads-quote">
            "CAADS is more than just a center – it is a vision for empowering
            students with knowledge, innovation, and the spirit of discovery."
          </p>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
