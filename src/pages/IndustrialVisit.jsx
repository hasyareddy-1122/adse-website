import OptimizedImage from "../components/OptimizedImage.jsx";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './IndustrialVisit.css'

export default function IndustrialVisit() {
  return (
    <div className="iv-page">
      <Navbar />

      {/* Hero */}
      <section className="iv-hero">
        <div className="iv-hero-content">
          <h1>Industrial Visit</h1>
          <p>Exploring industries, gaining real-world knowledge, and bridging the gap between classroom and workplace.</p>
        </div>
      </section>

      {/* About */}
      <section className="iv-about">
        <h2>About Our Department Industrial Visits</h2>

        {/* Row 1 */}
        <div className="iv-row">
          <div className="iv-text">
            <p>
              At CHRIST (Deemed to be University), Department of Computer Science and Engineering,
              Industrial Visits are an integral part of our academic curriculum.
              They offer students a unique opportunity to witness practical applications
              of theoretical concepts learned in classrooms.
            </p>
          </div>
          <div className="iv-image">
            <OptimizedImage src="/assets/industrial1.jpg" alt="Industrial Visit 1"  />
          </div>
        </div>

        {/* Row 2 */}
        <div className="iv-row reverse">
          <div className="iv-text">
            <p>
              Through these visits, students interact with industry experts, observe
              real-time processes, and understand emerging technologies shaping the future.
              Such experiences not only enhance their technical knowledge but also
              build teamwork, communication, and problem-solving skills.
            </p>
          </div>
          <div className="iv-image">
            <OptimizedImage src="/assets/industrial2.jpg" alt="Industrial Visit 2"  />
          </div>
        </div>

        {/* Row 3 */}
        <div className="iv-row">
          <div className="iv-text">
            <p>
              Each year, our department organizes visits to leading IT companies,
              research centers, and tech hubs, enabling our students to stay aligned
              with industry trends and expectations.
            </p>
          </div>
          <div className="iv-image">
            <OptimizedImage src="/assets/industrial3.jpg" alt="Industrial Visit 3"  />
          </div>
        </div>

        <div className="iv-highlight">
          "Learning beyond the classroom – Industrial Visits prepare our students for tomorrow's challenges."
        </div>
      </section>

      {/* Industrial Visits */}
      <section className="industrial-visits">
        <h2>Our Industrial Visits</h2>
        <div className="visit-card">
          <OptimizedImage src="/assets/Infosys_Mysore.jpg" alt="Infosys Mysore Visit"  />
          <div className="visit-content">
            <h3>Industrial Visit to Infosys, Mysore</h3>
            <p>
              Our students had the opportunity to visit Infosys Campus, Mysore – one of the largest corporate training 
              centers in the world. The visit provided deep insights into industry culture, modern training methodologies, 
              and emerging IT practices that bridge the gap between academics and corporate exposure.
            </p>
            <a href="#" className="iv-read-more">Read More →</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
