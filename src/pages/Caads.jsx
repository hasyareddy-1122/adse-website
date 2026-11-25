import OptimizedImage from "../components/OptimizedImage.jsx";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Caads.css'

export default function Caads() {
  return (
    <div className="caads-page">
      <Navbar />

      {/* Hero */}
      <section className="caads-hero">
        <div className="caads-hero-content">
          <h1>CAADS</h1>
          <p>Christ Association of AIML &amp; DS Students – where innovation meets collaboration.</p>
        </div>
      </section>

      {/* About CAADS */}
      <section className="about-caads-section">
        <h2>About <span>CAADS</span></h2>

        {/* Row 1 */}
        <div className="caads-row">
          <div className="caads-row-text">
            <p>The <b>C for AIML &amp; Data Science (CAADS)</b> at CHRIST (Deemed to be University) is a hub for innovation, research, and academic excellence in the fields of Artificial Intelligence and Data Science. It serves as a bridge between theory and practice, enabling students and faculty to work on cutting-edge projects, workshops, and industry collaborations.</p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads1.jpg" alt="CAADS Overview"  />
          </div>
        </div>

        {/* Row 2 */}
        <div className="caads-row reverse">
          <div className="caads-row-text">
            <p>CAADS regularly organizes <b>seminars, industrial visits, hackathons, and hands-on training sessions</b> where students gain exposure to real-world applications of AI and DS. The center actively encourages participation in research publications, competitions, and interdisciplinary projects that shape the future of intelligent systems.</p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads2.jpg" alt="CAADS Workshop"  />
          </div>
        </div>

        {/* Row 3 */}
        <div className="caads-row">
          <div className="caads-row-text">
            <p>Through its dedicated team of <b>faculty mentors and student committees</b>, CAADS nurtures creativity, problem-solving, and leadership. It also establishes strong connections with leading industries, research organizations, and academic institutions, providing students with invaluable exposure and opportunities.</p>
          </div>
          <div className="caads-row-img">
            <OptimizedImage src="/assets/caads3.jpg" alt="CAADS Students"  />
          </div>
        </div>

        <p className="caads-quote">
          "CAADS is more than just a center – it is a vision for empowering students with knowledge, innovation, and the spirit of discovery."
        </p>
      </section>

      <Footer />
    </div>
  )
}
