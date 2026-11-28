import OptimizedImage from "../components/OptimizedImage.jsx";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerGrid,
  StaggerItem,
} from "../components/MotionPrimitives";
import "./AboutUs.css";

import kuriakoseImg from "../assets/kuriakose_chavara.png";
import cmiImg from "../assets/cmi.jpg";
import chclgImg from "../assets/chclg.png";
import studentsStudyingImg from "../assets/students_studying.png";
import deanSpeakingImg from "../assets/dean_speaking.png";
import studentsGroupImg from "../assets/students_group.png";
import departmentImg from "../assets/department.png";
import treeImgAsset from "../assets/tree.png";
import deerImgAsset from "../assets/deer.png";

const HERO_EASE = [0.22, 1, 0.36, 1];

const HISTORY_ITEMS = [
  {
    year: "1831",
    highlight: true,
    dataImg: kuriakoseImg,
    description: (
      <>
        St Kuriakose Elias Chavara founded the
        <strong> Carmelites of Mary Immaculate (CMI)</strong>, laying the
        foundation for the educational vision that inspired CHRIST.
      </>
    ),
  },
  {
    year: "1969",
    special: "1969",
    description: (
      <>
        Christ College was established on 15 July 1969, beginning its journey
        with the vision of
        <strong> Excellence and Service.</strong>
      </>
    ),
  },
  {
    year: "1998",
    dataImg: cmiImg,
    isCmi: true,
    description: (
      <>
        Christ College became the first educational institution in Karnataka to
        receive accreditation from the National Assessment and Accreditation
        Council (NAAC).
      </>
    ),
  },
  {
    year: "2004",
    dataImg: chclgImg,
    isChclg: true,
    description: (
      <>
        The University Grants Commission (UGC) granted autonomous status to
        Christ College.
      </>
    ),
  },
  {
    year: "2006",
    description: (
      <>
        Christ College was recognised by the UGC as an
        <strong> Institution with Potential for Excellence.</strong>
      </>
    ),
  },
  {
    year: "2008",
    description: (
      <>
        Christ College was declared a<strong> Deemed to be University</strong>{" "}
        under Section 3 of the UGC Act, 1956.
      </>
    ),
  },
];

const FACULTY_ACHIEVEMENTS = [
  {
    name: "Dr. Michael Moses T",
    badge: "Chief Minister's Commendation",
    detail:
      "Honoured with the Chief Minister's Commendation for leadership and contributions to engineering and AI education.",
  },
  {
    name: "Dr. Mary Anita E. A.",
    badge: "100 Scopus-Indexed Publications",
    detail:
      "Achieved the milestone of 100 Scopus-indexed research publications in computing, AI, and data science.",
  },
  {
    name: "Recognized Research Faculty",
    badge: "Scholarly Excellence",
    detail:
      "Distinguished research contributions and recognitions by Dr. Neethu P. S., Dr. Shiju George, Prof. Chaitra P C, Dr. Bijeesh T V, and Dr. Santhrupth B C.",
  },
];

const ALUMNI_TESTIMONIALS = [
  {
    name: "Mishbah Pinto Chandy",
    programme: "B.Tech CSE (Data Science) · Class of 2025",
    placement: "Placed at Siemens Healthineers (Graduate Engineer Trainee)",
    quote:
      "My journey at Christ University has been one of growth, ambition, and aspiration. The years spent here shaped not only my academic foundation but also my perspective on pursuing excellence. Securing an opportunity with Siemens Healthineers marks the beginning of a meaningful chapter contributing to global healthcare breakthroughs.",
  },
  {
    name: "Aldona Rose Maria",
    programme: "B.Tech CSE (Artificial Intelligence & Machine Learning)",
    placement: "Department of AI and Data Science Engineering Alumni",
    quote:
      "Hands-on GPU labs, industry-aligned coursework, and continuous mentorship from faculty prepared me to tackle real-world AI and machine learning challenges with confidence.",
  },
  {
    name: "Sania Elizabath Manoj",
    programme: "B.Tech CSE (Data Science)",
    placement: "Department of AI and Data Science Engineering Alumni",
    quote:
      "Project-based learning, hackathons, and research opportunities at Kengeri Campus provided a strong launchpad for my career in data science and analytics.",
  },
];

export default function AboutUs() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const itemsRef = useRef([]);
  const defaultImgRef = useRef(null);
  const treeImgRef = useRef(null);
  const deerImgRef = useRef(null);

  const [currentImgSrc, setCurrentImgSrc] = useState(kuriakoseImg);
  const [imgVariantClass, setImgVariantClass] = useState("");
  const [showTree, setShowTree] = useState(false);
  const [showDeer, setShowDeer] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [deanModalOpen, setDeanModalOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const timelineEl = section?.querySelector(".timeline");

    if (!section || !timelineEl) return;

    const updateSectionHeight = () => {
      section.style.height = `${window.innerHeight + timelineEl.scrollHeight}px`;
    };

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const maxScroll = rect.height - window.innerHeight;

      if (maxScroll <= 0) return;

      const scrollProgress = Math.min(Math.max(-rect.top / maxScroll, 0), 1);

      const firstItemTop = itemsRef.current[0]?.offsetTop || 0;
      const scrollDistance = scrollProgress * timelineEl.scrollHeight;

      setLineHeight(scrollDistance);

      let step = 0;

      itemsRef.current.forEach((item, index) => {
        if (!item) return;

        const itemPosition = item.offsetTop - firstItemTop;

        if (scrollDistance >= itemPosition) {
          step = index;
        }
      });

      setActiveStep(step);

      const activeItem = HISTORY_ITEMS[step];

      if (activeItem.special === "1969") {
        setShowTree(true);
        setShowDeer(true);
      } else {
        setShowTree(false);
        setShowDeer(false);

        if (activeItem.dataImg) {
          setCurrentImgSrc(activeItem.dataImg);
          setImgVariantClass(
            activeItem.isCmi ? " cmi" : activeItem.isChclg ? " chclg" : "",
          );
        }
      }
    }

    updateSectionHeight();
    onScroll();

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", updateSectionHeight);

    const resizeObserver = new ResizeObserver(() => {
      updateSectionHeight();
      onScroll();
    });

    resizeObserver.observe(timelineEl);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSectionHeight);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".about-anim-card");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      {/* About Hero */}
      <section className="about-section">
        <OptimizedImage
          className="about-img top-left"
          src={kuriakoseImg}
          alt="St. Kuriakose"
        />
        <OptimizedImage
          className="about-img top-center"
          src={studentsStudyingImg}
          alt="Students reading"
        />
        <div className="vision-box-abs about-anim-card">
          <h2>VISION</h2>
          <p>
            Christ (Deemed to be University), a premier educational institution,
            is an academic fraternity of individuals dedicated to the motto of
            &quot;EXCELLENCE AND SERVICE.&quot;
          </p>
        </div>
        <motion.h1
          className="about-title"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: HERO_EASE }}>
          ABOUT US
        </motion.h1>
        <OptimizedImage
          className="about-img mid-right"
          src={deanSpeakingImg}
          alt="Speaker at podium"
        />
        <div className="mission-box-abs about-anim-card">
          <h2>MISSION</h2>
          <p>
            CHRIST (Deemed to be University) is a nurturing ground for an
            individual&apos;s holistic development to make effective
            contribution to the society in a dynamic environment.
          </p>
        </div>
        <OptimizedImage
          className="about-img bottom-center"
          src={studentsGroupImg}
          alt="Students working"
        />
        <OptimizedImage
          className="about-img bottom-right"
          src={departmentImg}
          alt="Smiling students"
        />
      </section>

      {/* History */}
      <section className="history-section" ref={sectionRef}>
        <h1 className="history-title">History</h1>
        <div className="history-content">
          <div className="history-image">
            <OptimizedImage
              src={currentImgSrc}
              className={`default-img active${imgVariantClass}`}
              alt="History step"
              ref={defaultImgRef}
            />

            <OptimizedImage
              src={treeImgAsset}
              className={`special-img tree${showTree ? " show" : ""}`}
              alt="Tree"
              ref={treeImgRef}
            />

            <OptimizedImage
              src={deerImgAsset}
              className={`special-img deer${showDeer ? " show" : ""}`}
              alt="Deer"
              ref={deerImgRef}
            />
          </div>

          <div className="timeline">
            <div
              className="timeline-line"
              style={{ height: lineHeight + "px" }}
              ref={lineRef}></div>

            {HISTORY_ITEMS.map((item, idx) => (
              <div
                key={item.year}
                className={`timeline-item${idx <= activeStep ? " active" : ""}`}
                ref={(el) => (itemsRef.current[idx] = el)}>
                <div className="year">{item.year}</div>

                <div
                  className={`dot${item.highlight ? " highlight" : ""}`}></div>

                <div className="description">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Section */}
      <section className="dept-section">
        <ScrollReveal className="dept-content">
          <div className="dept-text">
            <h1>Department of AI and Data Science Engineering</h1>
            <p>
              Located at the Bangalore Kengeri Campus under the School of
              Engineering and Technology, the Department offers BTech in
              Artificial Intelligence and Machine Learning, BTech CSE
              Specialization in Data Science, BTech CSE Specialization in
              Artificial Intelligence and Machine Learning, and MTech in Data
              Science.
            </p>
            <p style={{ marginTop: "12px" }}>
              Our vision is to excel in human-centred AI and data-driven
              innovation through ethical research, societal well-being, and
              transformative collaborations—supported by GPU computing labs,
              AWS/Azure/Google Cloud access, and industry certifications from
              CISCO, Red Hat, MongoDB, Festo, and Oracle Academy.
            </p>
          </div>
          <div className="dept-img">
            <OptimizedImage src={departmentImg} alt="Department Photo" />
          </div>
        </ScrollReveal>
      </section>

      {/* Scholarly Engagements & Faculty Achievements */}
      <section
        style={{
          background: "#f8f9fb",
          color: "#0f172a",
          padding: "72px 8%",
        }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <ScrollReveal>
            <h2
              style={{
                fontSize: "2.2rem",
                marginBottom: "10px",
                textAlign: "center",
              }}>
              Scholarly Engagements &amp; Faculty Achievements
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#5a6577",
                maxWidth: "740px",
                margin: "0 auto 40px",
              }}>
              Advancing research facilities, patents, industry collaborations,
              best teaching practices, and Scopus-indexed publications.
            </p>
          </ScrollReveal>

          <StaggerGrid
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "24px",
            }}>
            {FACULTY_ACHIEVEMENTS.map((item) => (
              <StaggerItem
                key={item.name}
                style={{
                  background: "#fff",
                  padding: "26px",
                  borderRadius: "18px",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
                }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    background: "#002147",
                    color: "#fff",
                    marginBottom: "12px",
                  }}>
                  {item.badge}
                </span>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
                  {item.name}
                </h3>
                <p style={{ color: "#475569", fontSize: "0.95rem" }}>
                  {item.detail}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>

          {/* Student & Alumni Testimonials */}
          <ScrollReveal>
            <h2
              style={{
                fontSize: "2.1rem",
                margin: "64px 0 10px",
                textAlign: "center",
              }}>
              Student &amp; Alumni Testimonials
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#5a6577",
                maxWidth: "700px",
                margin: "0 auto 36px",
              }}>
              Voices from our graduates leading innovation in global technology
              and healthcare organizations.
            </p>
          </ScrollReveal>

          <StaggerGrid
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}>
            {ALUMNI_TESTIMONIALS.map((t) => (
              <StaggerItem
                key={t.name}
                style={{
                  background: "#fff",
                  padding: "28px",
                  borderRadius: "18px",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                <p
                  style={{
                    color: "#334155",
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    marginBottom: "18px",
                  }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <strong style={{ display: "block", fontSize: "1.05rem" }}>
                    {t.name}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#0077cc",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}>
                    {t.programme}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      color: "#64748b",
                      marginTop: "2px",
                    }}>
                    {t.placement}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Dean Section */}
      <section className="dean-section">
        <ScrollReveal className="dean-container">
          <div className="dean-card">
            <OptimizedImage src={deanSpeakingImg} alt="Dr. Raghunandan Kumar" />
            <div className="dean-name">
              <h3>
                DR. RAGHUNANDAN KUMAR
                <br />
                BE, ME, MBA, PhD
              </h3>
            </div>
          </div>
          <div className="dean-text">
            <h1>Meet Our Dean</h1>
            <p>
              Dr. Raghunandan Kumar embodies the ideal academic leader: a
              seasoned educator, accomplished researcher, and visionary
              administrator.
            </p>
            <p>
              His strong credentials (BE, ME, MBA, PhD), significant scholarly
              output, active mentorship, and leadership in engineering education
              make him a tremendous asset to Christ University and an inspiring
              role model for students and faculty alike.
            </p>
            <button
              id="readMoreBtn"
              className="read-more-btn"
              onClick={() => setDeanModalOpen(true)}>
              Read More
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* Dean Modal */}
      <div
        className={`modal${deanModalOpen ? " open" : ""}`}
        id="deanModal"
        onClick={(e) => {
          if (e.target.classList.contains("modal")) setDeanModalOpen(false);
        }}>
        <div className="modal-content">
          <button className="close-btn" onClick={() => setDeanModalOpen(false)}>
            &times;
          </button>
          <h2>Message from the Dean</h2>
          <p>
            Welcome to the School of Engineering and Technology (SoET) at CHRIST
            (Deemed to be University). Established in 2009, SoET is a unique and
            fastest-growing school that equips students and scholars with the
            skills and competencies necessary to navigate the complexities of
            today&apos;s dynamic world. The school offers a wide range of
            programmes approved by the University Grants Commission (UGC) and
            All India Council for Technical Education (AICTE) and accredited by
            the National Assessment and Accreditation Council (NAAC) and
            National Board for Accreditation (NBA) through a blend of
            project-based and multidisciplinary curricula in emerging
            technologies including Honors and Minors in AI&amp;ML, Psychology,
            CIMA, Management, Geomatics, and Architecture.
          </p>
          <p>
            Spread across 78.5 acres, Kengeri Campus located off Mysore Road, is
            lush green with several amenities. The Mysore Horticulture Society,
            Lalbagh, Bangalore has awarded the Special Outstanding Prize of
            &apos;Best Ornamental Gardens&apos; to Kengeri Campus. The vibrancy
            of the campus is in its diversity among the students and faculty.
            Centres such as the Centre of Excellence (COE) in E-Mobility, and
            Frontier Materials, enable our researchers and scientists to be at
            the forefront of cutting-edge research, actively bridging the gap
            between innovation and education.
          </p>
          <p>
            The university instills critical thinking in our graduates to
            recognize human and societal needs; design innovativeness, and
            sustainable engineering solutions. Embrace an international
            perspective; and create value through entrepreneurial efforts.
          </p>
          <p>
            Our graduates stand out as exceptional problem-solvers, adept
            leaders, and skilled communicators through the holistic education
            imparted to them by the university. They exhibit remarkable
            adaptability in the face of new challenges within diverse,
            multicultural environments. Committed to continuous learning, they
            keep abreast of evolving and emerging technologies and stay
            responsive to the ever-changing demands of the workplace.
          </p>
          <p>
            SoET is an internationally recognized center of leading-edge
            technology and many students find unparalleled opportunities for
            real-world experience before they enter the workforce. CHRIST
            strives to develop the citizens of tomorrow by nurturing the
            individual&apos;s holistic development to make an effective
            contribution to society in a dynamic environment, which drives us
            toward the pursuit of excellence.
          </p>
          <p>
            I invite you to be part of this unique transformative journey with
            our motto of &apos;Excellence and Service&apos;.
          </p>
          <p>
            <strong>DR. RAGHUNANDAN KUMAR</strong>
            <br />
            BE, ME, MBA, PhD
            <br />
            Email: dean.engineering@christuniversity.in
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
