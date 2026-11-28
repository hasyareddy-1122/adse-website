import OptimizedImage from "../components/OptimizedImage.jsx";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerGrid,
  StaggerItem,
} from "../components/MotionPrimitives";
import { getApiUrl } from "../lib/api";
import "./Home.css";

const HERO_EASE = [0.22, 1, 0.36, 1];

const DEFAULT_DEPARTMENT_ACTIVITIES = [
  {
    id: "act-1",
    title: "Department Activities & CAADS",
    link: "/caads",
    description:
      "Student association initiatives, technical fests, coding competitions, and departmental engagements.",
  },
  {
    id: "act-2",
    title: "Faculty Development Activities",
    link: "/faculty-dev",
    description:
      "Workshops, FDPs, and advanced research training programmes attended and organized by ADSE faculty.",
  },
  {
    id: "act-3",
    title: "Seminar / Talks / Training Programs",
    link: "/department-events",
    description:
      "Expert guest lectures, startup leadership talks, and hands-on industry sessions in AI and Data Science.",
  },
  {
    id: "act-4",
    title: "Student Development Programme",
    modalKey: "student-dev",
    description:
      "Skill-building bootcamps, hackathon mentoring, and career readiness workshops for undergraduate and postgraduate students.",
  },
  {
    id: "act-5",
    title: "Industrial Visit",
    link: "/industrial-visit",
    description:
      "Curated industry exposure visits connecting classroom AI/ML theory with real-world enterprise deployments.",
  },
  {
    id: "act-6",
    title: "Memorandum of Understanding (MoU)",
    modalKey: "mou",
    description:
      "Academic and industry MoUs fostering joint research, certifications, and internship pipelines.",
  },
  {
    id: "act-7",
    title: "Extension & Service Learning Activity",
    link: "/service-learning",
    description:
      "Community outreach and socially responsible data science projects under CHRIST's Service Learning framework.",
  },
  {
    id: "act-8",
    title: "Student Publications & Patents",
    modalKey: "publications",
    description:
      "Peer-reviewed papers, conference proceedings, and patent filings authored by students and faculty mentors.",
  },
  {
    id: "act-9",
    title: "Curriculum Feedback Analysis",
    modalKey: "curriculum-feedback",
    description:
      "Structured curriculum review incorporating feedback from students, alumni, employers, and academic peers.",
  },
  {
    id: "act-10",
    title: "Awards & Recognition",
    modalKey: "awards",
    description:
      "National and institutional honours awarded to ADSE faculty and students.",
  },
];

const DEFAULT_SCHOLARLY_SECTIONS = [
  {
    id: "sch-toppers",
    title: "Department Toppers",
    tag: "Academic Excellence",
    summary:
      "Merit list of top-performing students across BTech AIML, BTech CSE (Data Science), BTech CSE (AIML), and MTech Data Science.",
    contentKey: "department.toppers",
    emptyNotice:
      "Semester and batch-wise Department Toppers list will be updated here shortly.",
  },
  {
    id: "sch-placements",
    title: "Placements & Career Outcomes",
    tag: "Industry Careers",
    summary:
      "Campus recruitment highlights, graduate engineer placements (including Siemens Healthineers), resume workshops, and interview prep.",
    contentKey: "department.placements",
    emptyNotice:
      "Detailed batch placement statistics and recruiter highlights will be updated here shortly.",
  },
  {
    id: "sch-research",
    title: "Research Facilities & Labs",
    tag: "Infrastructure",
    summary:
      "High-performance GPU computing laboratories with AWS, Azure, and Google Cloud access, plus active research in Explainable & Generative AI.",
    contentKey: "department.research",
    emptyNotice:
      "GPU lab specifications and ongoing funded research project details will be updated here shortly.",
  },
  {
    id: "sch-patents",
    title: "Patents & Publications",
    tag: "Innovation",
    summary:
      "Scopus-indexed journal publications (including 100+ publications milestone) and intellectual property filed by ADSE researchers.",
    contentKey: "department.patents",
    emptyNotice:
      "Complete patent registry and annual publication index will be updated here shortly.",
  },
  {
    id: "sch-industry",
    title: "Industry Collaboration",
    tag: "Certifications",
    summary:
      "Academia-industry partnerships with CISCO, Red Hat, MongoDB, Festo, and Oracle Academy offering specialized AIML & DS certifications.",
    contentKey: "department.industry",
    emptyNotice:
      "Partner certification schedules and collaborative lab details will be updated here shortly.",
  },
  {
    id: "sch-pedagogy",
    title: "Best Practices & Methods of Teaching",
    tag: "Pedagogy",
    summary:
      "Project-based learning, hackathons, ethical AI case studies, and experiential learning methodologies.",
    contentKey: "department.pedagogy",
    emptyNotice:
      "Departmental teaching-learning frameworks and best practice reports will be updated here shortly.",
  },
];

const ACTIVITY_MODAL_FALLBACKS = {
  "student-dev": {
    title: "Student Development Programme (SDP)",
    body: "The Department conducts hands-on workshops, coding bootcamps, hackathon preparation clinics, and technical certification drives in Python, TensorFlow, PyTorch, R, and Spark to keep students aligned with evolving industry standards.",
    note: "Upcoming SDP schedules and participant rosters will be published here.",
  },
  mou: {
    title: "Memorandum of Understanding (MoU)",
    body: "Through strategic academic and industry MoUs—including collaborations with CISCO, Red Hat, MongoDB, Festo, and Oracle Academy—students gain access to certified training tracks, guest lectures, and collaborative R&D.",
    note: "Signed MoU summaries and partner details will be updated here.",
  },
  publications: {
    title: "Student Publications & Patents",
    body: "Undergraduate and postgraduate students actively publish research findings alongside faculty mentors in Scopus-indexed journals and international AI/Data Science conferences, alongside filing utility and design patents.",
    note: "Year-wise student publication and patent records will be added here.",
  },
  "curriculum-feedback": {
    title: "Curriculum Feedback Analysis",
    body: "To keep the BTech and MTech curricula responsive to global technological shifts, the department systematically collects and analyzes structured feedback from students, alumni, industry experts, and faculty.",
    note: "Annual curriculum feedback action-taken reports will be uploaded here.",
  },
  awards: {
    title: "Awards & Recognition",
    body: "Celebrating academic, research, and leadership recognitions—including Dr. Michael Moses T's Chief Minister's Commendation and Dr. Mary Anita E. A.'s 100 Scopus-indexed publications milestone.",
    note: "Additional student and faculty honours will be listed here.",
  },
};

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hodOpen, setHodOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(null);
  const [activeInfoModal, setActiveInfoModal] = useState(null);

  const [facultyData, setFacultyData] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);
  const [departmentActivities, setDepartmentActivities] = useState(
    DEFAULT_DEPARTMENT_ACTIVITIES,
  );
  const [siteContent, setSiteContent] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;
  const searchTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFaculty() {
      try {
        const res = await fetch(getApiUrl("/api/faculties"), {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Faculty API failed: HTTP ${res.status}`);
        }

        const payload = await res.json();

        if (!Array.isArray(payload?.faculties)) {
          throw new Error("Faculty API returned an invalid response");
        }

        if (cancelled) return;

        const data = payload.faculties;
        setFacultyData(data);
        setFilteredData(data);
      } catch (err) {
        console.error("Failed to load faculty data from the database:", err);
      }
    }

    loadFaculty();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDepartmentContent() {
      try {
        const res = await fetch(getApiUrl("/api/content"), {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Content API failed: HTTP ${res.status}`);
        }

        const payload = await res.json();
        const contentMap = payload?.content || {};

        if (!cancelled) {
          setSiteContent(contentMap);
          const activities = contentMap["department.activities"];
          if (Array.isArray(activities) && activities.length > 0) {
            setDepartmentActivities(activities);
          }
        }
      } catch (err) {
        console.error("Failed to load Department Content:", err);
      }
    }

    loadDepartmentContent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDepartmentEvents() {
      try {
        const res = await fetch(getApiUrl("/api/events"), {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Events API failed: HTTP ${res.status}`);
        }

        const payload = await res.json();
        const allEvents = Array.isArray(payload?.events) ? payload.events : [];

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const featured = allEvents.filter((e) => e.isFeatured);
        const upcoming = allEvents.filter((e) => {
          const d = e.eventDate ? new Date(e.eventDate) : null;
          return d && !Number.isNaN(d.getTime()) && d >= startOfToday;
        });

        const combined = [];
        const seenIds = new Set();

        for (const ev of [...featured, ...upcoming, ...allEvents]) {
          if (!seenIds.has(ev.id)) {
            seenIds.add(ev.id);
            combined.push(ev);
          }
          if (combined.length >= 4) break;
        }

        if (!cancelled) {
          setDepartmentEvents(combined);
        }
      } catch (err) {
        console.error("Failed to load Department Events:", err);
      }
    }

    loadDepartmentEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();

      const filtered = facultyData.filter((f) =>
        (f.name || "").toLowerCase().includes(q),
      );

      setFilteredData(filtered);
      setCurrentPage(1);
    }, 120);

    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, facultyData]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const pageItems = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  useEffect(() => {
    function handleClick(e) {
      if (e.target.classList.contains("modal")) {
        setAboutOpen(false);
        setHodOpen(false);
        setProgramOpen(null);
        setActiveInfoModal(null);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  function openActivityModal(activity) {
    const fallback = ACTIVITY_MODAL_FALLBACKS[activity.modalKey];
    setActiveInfoModal({
      title: activity.title,
      body:
        activity.description ||
        fallback?.body ||
        "Departmental activity details will be updated soon.",
      note:
        fallback?.note ||
        "Records and updates for this section can be added via the Admin Dashboard.",
      items: null,
    });
  }

  function openScholarlyModal(section) {
    const rawSaved = siteContent?.[section.contentKey];
    const savedItems = Array.isArray(rawSaved) ? rawSaved : null;
    const savedText = typeof rawSaved === "string" ? rawSaved : null;

    setActiveInfoModal({
      title: section.title,
      body: savedText || section.summary,
      note: savedItems && savedItems.length > 0 ? null : section.emptyNotice,
      items: savedItems,
    });
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: HERO_EASE }}>
              <h1>Department of AI and Data Science Engineering</h1>
              <p>
                School of Engineering and Technology · Bangalore Kengeri Campus.
                Equipping students with strong theoretical foundations and
                practical expertise in Artificial Intelligence, Machine
                Learning, Deep Learning, Natural Language Processing, Computer
                Vision, and Big Data Analytics.
              </p>
            </motion.div>
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: HERO_EASE }}>
              <button
                type="button"
                className="btn btn-filled"
                onClick={() => scrollToSection("programs")}>
                Programmes Offered
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => scrollToSection("faculty")}>
                Faculty Profiles
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => scrollToSection("scholarly-engagements")}>
                Toppers &amp; Achievements
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section id="mission-vision" className="mission-vision-section">
        <ScrollReveal className="mission-vision-container">
          <div className="mission-vision-content">
            <div className="mission-text">
              <h2>
                EMPOWERING THE FUTURE
                <br />
                OF AI AND DATA SCIENCE
                <br />
                THROUGH INNOVATION
                <br />
                AND COLLABORATION
              </h2>
              <p>
                Dedicated to advancing cutting-edge technologies through ethical
                research, high-performance computing labs, industry-aligned
                curricula, and transformative collaborations at Bangalore
                Kengeri Campus.
              </p>
            </div>
            <div className="mission-cards">
              <article className="mission-card">
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                      fill="white"
                      d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm119.8 149.9c6.3 6.2 6.3 16.4 0 22.6l-96 96c-6.2 6.3-16.4 6.3-22.6 0l-37.3-37.4-61.3 61.3c-6.2 6.3-16.4 6.3-22.6 0s-6.3-16.4 0-22.6l72.6-72.6c6.2-6.3 16.4-6.3 22.6 0l37.4 37.3 84.7-84.7c6.2-6.3 16.4-6.3 22.6 0z"
                    />
                    <circle cx="440" cy="440" r="8" fill="white" />
                  </svg>
                </div>
                <h3>OUR MISSION</h3>
                <p>
                  Empowering individuals to ethically harness data and AI,
                  fostering a dynamic research environment for global
                  well-being, and innovating scientific knowledge and
                  entrepreneurship through academia-industry collaborations.
                </p>
              </article>
              <article className="mission-card">
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path
                      fill="white"
                      d="M104 208c13.3 0 24 10.7 24 24v176c0 13.3-10.7 24-24 24s-24-10.7-24-24V232c0-13.3 10.7-24 24-24zm152-80c13.3 0 24 10.7 24 24v256c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zm176 64c13.3 0 24 10.7 24 24v192c0 13.3-10.7 24-24 24s-24-10.7-24-24V216c0-13.3 10.7-24 24-24z"
                    />
                  </svg>
                </div>
                <h3>OUR VISION</h3>
                <p>
                  To excel in human-centred AI and data-driven innovation
                  through ethical research, societal well-being, and
                  transformative collaborations.
                </p>
              </article>
            </div>
          </div>
          <OptimizedImage
            src="/assets/sohini.jpg"
            alt="Students working on computers"
            className="mission-image"
          />
        </ScrollReveal>
      </section>

      {/* About + HOD */}
      <section id="about">
        <ScrollReveal className="about-container">
          <div className="about-left">
            <h2>About Department</h2>
            <p>
              The Department offers BTech in Artificial Intelligence and Machine
              Learning, BTech CSE Specialization in Data Science, BTech CSE
              Specialization in Artificial Intelligence and Machine Learning,
              and MTech in Data Science at Bangalore Kengeri Campus. It equips
              students with strong theoretical foundations and practical skills
              in Artificial Intelligence, Machine Learning, Deep Learning,
              Natural Language Processing, Computer Vision, Data Analytics, and
              Intelligent Systems, while promoting ethical AI practices,
              internships, real-time projects, and hackathons. <br />
              <a
                href="#"
                id="readMoreBtn"
                onClick={(e) => {
                  e.preventDefault();
                  setAboutOpen(true);
                }}>
                Read more...
              </a>
            </p>
          </div>
          <div className="about-right">
            <div className="vision-box">
              <h3>Vision</h3>
              <p>
                To excel in human-centred AI and data-driven innovation through
                ethical research, societal well-being, and transformative
                collaborations.
              </p>
            </div>
            <div className="mission-box">
              <h3>Mission</h3>
              <ul>
                <li>
                  <strong>M1:</strong> Empowering individuals to ethically
                  harness data and AI through accessible and value-driven
                  curriculum.
                </li>
                <li>
                  <strong>M2:</strong> Foster a dynamic research environment
                  that advances innovative and impactful solutions for the
                  betterment of global well-being.
                </li>
                <li>
                  <strong>M3:</strong> Innovate scientific knowledge and
                  Entrepreneurship through academia and Industry collaborations.
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* HOD */}
        <ScrollReveal className="hod-section" delay={0.1}>
          <div className="hod-container">
            <div className="hod-image">
              <OptimizedImage
                src="/assets/hod-image.webp"
                alt="Dr. Michael Moses T - HOD"
              />
              <h3>Dr. Michael Moses T</h3>
              <p>
                <a href="mailto:hod.adse@christuniversity.in">
                  hod.adse@christuniversity.in
                </a>
              </p>
            </div>
            <div className="hod-message">
              <h2>
                Message from <span>the HOD</span>
              </h2>
              <p>
                We are at the vanguard of a technological revolution in which
                data-driven solutions and intelligent systems are reshaping
                every industry. At CHRIST (Deemed to be University), the
                Department of AI and Data Science Engineering is dedicated to
                fostering the next wave of researchers, innovators and moral AI
                experts who can develop significant answers to pressing
                problems. Academic rigour and experiential learning are
                integrated in our department through project-based learning,
                research, industry collaboration and internships...
              </p>
              <a
                href="#"
                id="hodReadMore"
                className="read-more"
                onClick={(e) => {
                  e.preventDefault();
                  setHodOpen(true);
                }}>
                Read more...
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* About popup */}
      <div id="popupBox" className={`modal${aboutOpen ? " open" : ""}`}>
        <div className="modal-content">
          <button className="close-btn" onClick={() => setAboutOpen(false)}>
            &times;
          </button>
          <h2>About the Department of AI and Data Science Engineering</h2>
          <p>
            The Department offers BTech in Artificial Intelligence and Machine
            Learning, BTech CSE Specialization in Data Science, BTech CSE
            Specialization in Artificial Intelligence and Machine Learning and
            MTech in Data Science at Bangalore Kengeri Campus. It focuses on
            equipping students with strong theoretical foundations and practical
            skills in areas such as Artificial Intelligence, Machine Learning,
            Deep Learning, Natural Language Processing, Computer Vision, Data
            Analytics, and Intelligent Systems.
          </p>
          <p>
            The curriculum is designed to meet industry demands and foster
            innovation, creativity, and critical thinking. With experienced
            faculty, modern laboratories, and industry collaborations, the
            department offers a rich learning environment for research and
            development. Students are encouraged to participate in internships,
            real-time projects and hackathons to gain hands-on experience, while
            promoting ethical AI practices through societal impact awareness.
          </p>
          <p>
            Graduates are well-prepared for careers in data science, AI
            research, software development, and analytics across sectors
            including healthcare, finance, education, robotics, and emerging
            technologies. The department conducts workshops and industry
            hands-on sessions regularly to equip students with the latest tools
            in AI and data science.
          </p>
          <h3>Overview</h3>
          <p>
            The Department of AI and Data Science Engineering is dedicated to
            advancing cutting-edge technologies that are shaping the future.
          </p>
          <h3>Key Features</h3>
          <ul>
            <li>
              High-performance computing labs with GPUs and access to cloud
              platforms (AWS, Azure, Google Cloud) and data science tools.
            </li>
            <li>
              Best-in-class infrastructure and faculty profile with an
              industry-aligned curriculum covering AI, ML, deep learning, NLP,
              computer vision, and big data analytics using Python, TensorFlow,
              PyTorch, R, and Spark.
            </li>
            <li>
              Active research in explainable AI, generative models, ethical AI
              and data science with faculty-student publications in reputed
              journals and conferences.
            </li>
            <li>
              Intense industry-academia interface with leading companies
              including CISCO, Red Hat, MongoDB, Festo and Oracle Academy with
              certifications in AIML/DS.
            </li>
            <li>
              Strong placement records with dedicated support on
              resume-building, interview prep and career counselling sessions.
            </li>
          </ul>
        </div>
      </div>

      {/* HOD popup */}
      <div id="hodPopup" className={`modal${hodOpen ? " open" : ""}`}>
        <div className="modal-content">
          <button className="close-btn" onClick={() => setHodOpen(false)}>
            &times;
          </button>
          <h2>Message from the HOD</h2>
          <p>
            We are at the vanguard of a technological revolution in which
            data-driven solutions and intelligent systems are reshaping every
            industry. At CHRIST (Deemed to be University), the Department of AI
            and Data Science Engineering is dedicated to fostering the next wave
            of researchers, innovators and moral AI experts who can develop
            significant answers to pressing problems.
          </p>
          <p>
            Academic rigour and experiential learning are integrated in our
            department. Our students participate in project-based learning,
            research, industry collaboration and internships as part of a
            comprehensive curriculum that is tailored to stay up with global
            advancements. We place a strong emphasis on holistic education,
            which promotes societal impact, interdisciplinary learning, and
            critical thinking.
          </p>
          <p>
            We take great pride in the lively learning environment we foster,
            our committed faculty and our active student body. As we expand, we
            want to establish ourselves as a centre for innovation and teaching
            in the fields of artificial intelligence, machine learning and data
            science. I encourage you to investigate the opportunities in our
            department and work with us to create a future.
          </p>
          <p>
            <strong>Dr. Michael Moses T</strong>
            <br />
            Head of Department, AI and Data Science Engineering
            <br />
            Email:{" "}
            <a href="mailto:hod.adse@christuniversity.in">
              hod.adse@christuniversity.in
            </a>
          </p>
        </div>
      </div>

      {/* Department Activities & Events */}
      <ScrollReveal>
        <section className="department-section">
          <div className="department-activities">
            <h2>
              <span>Department</span> Activities
            </h2>

            {departmentActivities.length > 0 ? (
              departmentActivities.map((activity, index) => {
                const hasRoute =
                  activity.link &&
                  activity.link !== "#" &&
                  activity.link !== "/about";

                if (hasRoute) {
                  return (
                    <Link
                      key={activity.id ?? index}
                      to={activity.link}
                      className="activity-card"
                      style={{ color: "#000" }}>
                      {activity.title}
                      <span style={{ color: "#000" }}>→</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={activity.id ?? index}
                    type="button"
                    className="activity-card"
                    onClick={() => openActivityModal(activity)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      color: "#000",
                      background: "#fff",
                      cursor: "pointer",
                      font: "inherit",
                    }}>
                    {activity.title}
                    <span style={{ color: "#000" }}>→</span>
                  </button>
                );
              })
            ) : (
              <p>No department activities have been announced.</p>
            )}
          </div>
          <div className="department-events">
            <h2>
              <span>Department</span> Events
            </h2>
            {departmentEvents.length > 0 ? (
              departmentEvents.map((event, index) => {
                const parsedDate = event.eventDate
                  ? new Date(event.eventDate)
                  : null;

                const validDate =
                  parsedDate && !Number.isNaN(parsedDate.getTime());

                const shortDate = validDate
                  ? parsedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })
                  : "TBA";

                const year = validDate ? parsedDate.getFullYear() : "";

                const fullDate = validDate
                  ? parsedDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "To be announced";

                const timeRange =
                  event.startTime && event.endTime
                    ? `${event.startTime} – ${event.endTime}`
                    : event.startTime || null;

                return (
                  <div className="event" key={event.id ?? index}>
                    <div className="event-date">
                      {shortDate}
                      <br />
                      <span>{year}</span>
                    </div>

                    <div className="event-details">
                      <p>
                        <b>{event.title}</b>
                        <br />
                        {event.description}
                        <br />
                        Date: {fullDate}
                        {timeRange ? ` | Time: ${timeRange}` : ""}
                        {event.venue ? ` | Venue: ${event.venue}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="event">
                <div className="event-date">
                  Nov 30
                  <br />
                  <span>2026</span>
                </div>
                <div className="event-details">
                  <p>
                    <b>
                      Guest Talk on &apos;Student to Entrepreneur: Leadership
                      and Path to Building Startups&apos;
                    </b>
                    <br />
                    Department of AI and Data Science Engineering seminar on
                    entrepreneurship and startup leadership.
                    <br />
                    Date: 30 November 2026 | Venue: Bangalore Kengeri Campus
                  </p>
                </div>
              </div>
            )}

            <Link to="/department-events" className="view-all">
              View all events →
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Scholarly Engagements, Department Toppers & Records */}
      <section
        id="scholarly-engagements"
        style={{
          background: "#f8f9fb",
          color: "#0f172a",
          padding: "76px 8%",
          borderTop: "1px solid rgba(15, 23, 42, 0.06)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <ScrollReveal>
            <span
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#0077cc",
                marginBottom: "8px",
              }}>
              Scholarly &amp; Cultural Engagements
            </span>
            <h2
              style={{
                fontSize: "2.25rem",
                textAlign: "center",
                marginBottom: "12px",
                color: "#0f172a",
              }}>
              Department Toppers, Research &amp; Outcomes
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#5a6577",
                maxWidth: "740px",
                margin: "0 auto 42px",
              }}>
              Explore academic toppers, placement milestones, GPU research
              facilities, Scopus-indexed publications, patents, and industry
              collaborations.
            </p>
          </ScrollReveal>

          <StaggerGrid
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
              gap: "22px",
            }}
            stagger={0.06}>
            {DEFAULT_SCHOLARLY_SECTIONS.map((sec) => {
              const savedEntries = Array.isArray(siteContent?.[sec.contentKey])
                ? siteContent[sec.contentKey]
                : [];

              return (
                <StaggerItem
                  key={sec.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "26px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "3px 11px",
                          borderRadius: "999px",
                          background: "#002147",
                          color: "#fff",
                        }}>
                        {sec.tag}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color:
                            savedEntries.length > 0 ? "#15803d" : "#64748b",
                          fontWeight: 600,
                        }}>
                        {savedEntries.length > 0
                          ? `${savedEntries.length} Records`
                          : "Records Pending"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
                      {sec.title}
                    </h3>
                    <p style={{ color: "#475569", fontSize: "0.94rem" }}>
                      {sec.summary}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openScholarlyModal(sec)}
                      style={{ padding: "8px 18px", fontSize: "0.86rem" }}>
                      View Details
                    </button>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* Faculty */}
      <section id="faculty">
        <ScrollReveal>
          <h1>Meet our Faculties</h1>
          <section className="faculty-search">
            <div className="search-container">
              <OptimizedImage
                src="https://cdn.builder.io/api/v1/image/assets/5e358c269d9140e1be810ef6482a3f72/2cef4ee11033eecb4a19ef2637573b4246bf4c9b?placeholderIfAbsent=true"
                alt="Search icon"
              />
              <input
                type="text"
                id="search-input"
                placeholder="Search faculty…"
                aria-label="Search faculty"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>
        </ScrollReveal>

        {pageItems.length === 0 ? (
          <div id="faculty-container" className="faculty-grid">
            <p>No faculty found.</p>
          </div>
        ) : (
          <StaggerGrid
            key={`${currentPage}-${searchQuery}`}
            id="faculty-container"
            className="faculty-grid"
            stagger={0.04}>
            {pageItems.map((f) => (
              <StaggerItem className="faculty-card" key={f.id}>
                <OptimizedImage src={`/${f.image}`} alt={f.name} />
                <h3>{f.name}</h3>
                <h4>{f.department}</h4>
                <p>Specialization: {f.specialization}</p>
                <Link to={`/faculty?id=${f.id}`}>
                  <button type="button">View</button>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}

        {totalPages > 1 && (
          <div id="pagination" className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(n)}>
                {n}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="features-container">
          <ScrollReveal className="features-header">
            <span className="features-label">Department Highlights</span>
            <h2>INFRASTRUCTURE, RESEARCH &amp; INDUSTRY COLLABORATION</h2>
            <p>
              High-performance GPU computing labs, cloud access (AWS, Azure,
              Google Cloud), active research in Explainable &amp; Generative AI,
              and industry certifications with CISCO, Red Hat, MongoDB, Festo,
              and Oracle Academy.
            </p>
          </ScrollReveal>
          <StaggerGrid className="features-cards" stagger={0.09}>
            <StaggerItem className="feature-card">
              <OptimizedImage
                src="/assets/GPU-Labs.png"
                alt="High-Performance GPU Labs & Cloud Platforms"
              />
              <h3>GPU Computing Labs &amp; Cloud Ecosystem</h3>
              <p>
                High-performance computing laboratories equipped with GPUs and
                access to AWS, Azure, Google Cloud, Python, TensorFlow, PyTorch,
                R, and Spark.
              </p>
            </StaggerItem>
            <StaggerItem className="feature-card">
              <OptimizedImage
                src="/assets/Table-discussion.png"
                alt="Industry Certifications & Collaborations"
              />
              <h3>Industry Interface &amp; Global Certifications</h3>
              <p>
                Intense academia-industry collaboration with CISCO, Red Hat,
                MongoDB, Festo, and Oracle Academy offering AIML and Data
                Science certifications.
              </p>
            </StaggerItem>
            <StaggerItem className="feature-card">
              <OptimizedImage
                src="/assets/denery-banner1.jpg"
                alt="Research & Placement Excellence"
              />
              <h3>Explainable AI Research &amp; Placements</h3>
              <p>
                Scopus-indexed faculty-student research in Explainable AI,
                Generative Models, and Ethical AI backed by strong placements
                and career mentorship.
              </p>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* Programs */}
      <section id="programs">
        <StaggerGrid className="programs-grid" stagger={0.08}>
          <StaggerItem className="card">
            <div
              className="card-header"
              style={{
                backgroundImage: "url('/assets/college5.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}>
              <div
                className="card-header"
                style={{
                  backgroundImage: "url('/assets/onlinedeg.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}></div>
              <OptimizedImage
                src="/assets/und-logo.webp"
                alt="Undergraduate Logo"
                className="profile-img"
              />
            </div>
            <div className="card-body">
              <h3>Undergraduate</h3>
              <p>
                Comprehensive 4-year BTech programmes in AI &amp; ML and CSE
                specialisations in Data Science &amp; AIML (with Lateral Entry
                options) at Bangalore Kengeri Campus.
              </p>
              <button onClick={() => setProgramOpen("undergraduate")}>
                More Info
              </button>
            </div>
          </StaggerItem>

          <StaggerItem className="card">
            <div
              className="card-header"
              style={{
                backgroundImage: "url('/assets/postgrad.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}>
              <OptimizedImage
                src="/assets/pg-logo.jpg"
                alt="Postgraduate Logo"
                className="profile-img"
              />
            </div>
            <div className="card-body">
              <h3>Postgraduate</h3>
              <p>
                2-year MTech in Data Science focused on advanced theoretical
                foundations, big data analytics, research, and specialization.
              </p>
              <button onClick={() => setProgramOpen("postgraduate")}>
                More Info
              </button>
            </div>
          </StaggerItem>

          <StaggerItem className="card">
            <div
              className="card-header"
              style={{
                backgroundImage: "url('/assets/phd.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}>
              <OptimizedImage
                src="/assets/images.png"
                alt="PhD Logo"
                className="profile-img"
              />
            </div>
            <div className="card-body">
              <h3>PhD</h3>
              <p>
                Doctoral research in Explainable AI, Generative Models, Computer
                Vision, NLP, and Ethical Data Science.
              </p>
              <button onClick={() => setProgramOpen("phd")}>More Info</button>
            </div>
          </StaggerItem>

          <StaggerItem className="card">
            <div
              className="card-header"
              style={{
                backgroundImage: "url('/assets/onlinedeg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}>
              <OptimizedImage
                src="/assets/ondeg-logo.jpg"
                alt="Industry Certifications Logo"
                className="profile-img"
              />
            </div>
            <div className="card-body">
              <h3>Certifications &amp; Exchange</h3>
              <p>
                Industry certifications (CISCO, Red Hat, MongoDB, Oracle
                Academy), Honors/Minors, and international university exchange.
              </p>
              <button onClick={() => setProgramOpen("online")}>
                More Info
              </button>
            </div>
          </StaggerItem>
        </StaggerGrid>
      </section>

      {/* Activity / Toppers / Scholarly Detail Modal */}
      {activeInfoModal && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveInfoModal(null);
            }
          }}>
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setActiveInfoModal(null)}>
              &times;
            </button>
            <h2>{activeInfoModal.title}</h2>
            <p>{activeInfoModal.body}</p>

            {Array.isArray(activeInfoModal.items) &&
              activeInfoModal.items.length > 0 && (
                <ul style={{ marginTop: "14px", paddingLeft: "20px" }}>
                  {activeInfoModal.items.map((entry, i) => (
                    <li key={entry.id ?? i} style={{ marginBottom: "8px" }}>
                      {typeof entry === "string" ? (
                        entry
                      ) : (
                        <>
                          <strong>{entry.name || entry.title}</strong>
                          {entry.programme || entry.subtitle
                            ? ` — ${entry.programme || entry.subtitle}`
                            : ""}
                          {entry.batch || entry.year
                            ? ` (${entry.batch || entry.year})`
                            : ""}
                          {entry.description ? `: ${entry.description}` : ""}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

            {activeInfoModal.note && (
              <p
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#475569",
                  fontSize: "0.9rem",
                }}>
                {activeInfoModal.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Programme Information Modals */}
      {programOpen && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setProgramOpen(null);
            }
          }}>
          <div className="modal-content program-modal">
            <button className="close-btn" onClick={() => setProgramOpen(null)}>
              &times;
            </button>

            {programOpen === "undergraduate" && (
              <>
                <h2>Undergraduate Programmes (Bangalore Kengeri Campus)</h2>
                <p>
                  Comprehensive 4-year (8-semester) undergraduate engineering
                  programmes building strong theoretical foundations and
                  hands-on industry expertise.
                </p>

                <h3>
                  1. BTech in Artificial Intelligence and Machine Learning
                </h3>
                <ul>
                  <li>
                    <strong>Focus Areas:</strong> Intelligent systems, neural
                    networks, deep learning, natural language processing,
                    computer vision, supervised/unsupervised learning, and
                    real-world AI application design.
                  </li>
                  <li>
                    <strong>Selection Process:</strong> Entrance Test (ET – 90
                    mins), Skill Assessment (SA), Micro Presentation (MP), and
                    Personal Interview (PI).
                  </li>
                </ul>

                <h3>
                  2. BTech in Computer Science and Engineering (Artificial
                  Intelligence and Machine Learning)
                </h3>
                <ul>
                  <li>
                    <strong>Tracks:</strong> Regular (4 Years) &amp; Lateral
                    Entry (for 3-year Diploma holders).
                  </li>
                  <li>
                    <strong>Core Pillars:</strong> Artificial Intelligence,
                    Machine Learning, Computer Science fundamentals
                    (programming, algorithms, databases, OS, software
                    engineering), and Data Science.
                  </li>
                  <li>
                    <strong>Career Outcomes:</strong> Machine Learning Engineer,
                    AI Solutions Developer, Deep Learning Engineer, Predictive
                    Analytics Specialist.
                  </li>
                </ul>

                <h3>
                  3. BTech in Computer Science and Engineering (Data Science)
                </h3>
                <ul>
                  <li>
                    <strong>Tracks:</strong> Regular (4 Years) &amp; Lateral
                    Entry (for 3-year Diploma holders).
                  </li>
                  <li>
                    <strong>Core Pillars:</strong> Data Science, Artificial
                    Intelligence, Big Data Analytics (distributed systems, cloud
                    platforms), and Computer Science fundamentals.
                  </li>
                  <li>
                    <strong>Career Outcomes:</strong> Data Analyst, Business
                    Intelligence (BI) Analyst, Big Data Engineer, Data Pipeline
                    Engineer, Cloud Data Engineer, Data Architect.
                  </li>
                </ul>
              </>
            )}

            {programOpen === "postgraduate" && (
              <>
                <h2>Postgraduate Programme (Bangalore Kengeri Campus)</h2>
                <p>
                  Postgraduate studies focused on advanced knowledge,
                  research-driven specialization, and industry leadership in
                  Data Science.
                </p>
                <h3>MTech in Data Science (2 Years)</h3>
                <ul>
                  <li>
                    <strong>Focus Areas:</strong> Advanced data analytics,
                    machine learning, deep learning, big data engineering,
                    intelligent systems, and applied research projects.
                  </li>
                  <li>
                    <strong>Eligibility:</strong> BTech / BE / MSc in a relevant
                    discipline with a minimum of 55% aggregate marks from a
                    recognized university.
                  </li>
                </ul>
              </>
            )}

            {programOpen === "phd" && (
              <>
                <h2>Doctoral Research &amp; Scholarly Engagements</h2>
                <p>
                  The department fosters a dynamic research environment with
                  active faculty-student publications in Scopus-indexed journals
                  and international conferences.
                </p>
                <h3>Key Research Domains</h3>
                <ul>
                  <li>Explainable AI (XAI) and Ethical AI</li>
                  <li>Generative Models and Deep Learning</li>
                  <li>Natural Language Processing and Computer Vision</li>
                  <li>Big Data Analytics and Intelligent Systems</li>
                </ul>
              </>
            )}

            {programOpen === "online" && (
              <>
                <h2>
                  Industry Certifications, Honors &amp; Experiential Learning
                </h2>
                <p>
                  Students complement their core degree with industry-recognized
                  certifications, interdisciplinary minors, and global exposure.
                </p>
                <h3>Key Opportunities</h3>
                <ul>
                  <li>
                    <strong>Industry Certifications:</strong> CISCO, Red Hat,
                    MongoDB, Festo, and Oracle Academy certifications in AIML
                    and Data Science.
                  </li>
                  <li>
                    <strong>Experiential Learning:</strong> Mandatory
                    internships, real-time industry projects, hackathons, and
                    Service Learning initiatives.
                  </li>
                  <li>
                    <strong>Global &amp; Interdisciplinary Exposure:</strong>{" "}
                    Honors/Minors programmes and international university
                    exchange opportunities.
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
