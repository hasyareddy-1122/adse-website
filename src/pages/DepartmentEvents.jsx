import OptimizedImage from "../components/OptimizedImage.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getApiUrl } from "../lib/api";
import "./DepartmentEvents.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ScrollReveal,
  StaggerGrid,
  StaggerItem,
} from "../components/MotionPrimitives";

const HERO_EASE = [0.22, 1, 0.36, 1];

function resolveEventImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return getApiUrl(imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`);
}

function formatEventTimeRange(startTime, endTime) {
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  if (startTime) return startTime;
  if (endTime) return `Until ${endTime}`;
  return null;
}

function DepartmentEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await fetch(getApiUrl("/api/events"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load department events");
        }

        const data = await response.json();
        const allEvents = Array.isArray(data?.events) ? data.events : [];

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const upcoming = [];
        const past = [];

        for (const ev of allEvents) {
          const parsed = ev.eventDate ? new Date(ev.eventDate) : null;
          if (
            parsed &&
            !Number.isNaN(parsed.getTime()) &&
            parsed < startOfToday
          ) {
            past.push(ev);
          } else {
            upcoming.push(ev);
          }
        }

        upcoming.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        past.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

        if (!cancelled) {
          setUpcomingEvents(upcoming);
          setPastEvents(past);
        }
      } catch (err) {
        console.error("Error loading department events:", err);
        if (!cancelled) {
          setError("Unable to load department events right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderEventCard = (event, index) => {
    const date = event.eventDate ? new Date(event.eventDate) : null;
    const validDate = date && !Number.isNaN(date.getTime());
    const resolvedImg = resolveEventImageUrl(event.imageUrl);
    const timeRange = formatEventTimeRange(event.startTime, event.endTime);
    const eventPath =
      event.id != null ? `/event/${event.id}` : "/department-events";

    return (
      <StaggerItem key={event.id ?? index}>
        <article className="event">
          <div className="event-date">
            {validDate
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })
              : "TBA"}
            <br />
            <span>{validDate ? date.getFullYear() : ""}</span>
          </div>

          <div className="event-details">
            {resolvedImg && (
              <Link to={eventPath}>
                <OptimizedImage
                  src={resolvedImg}
                  alt={event.title}
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                />
              </Link>
            )}

            <h3>
              <Link to={eventPath}>{event.title}</Link>{" "}
              {event.isFeatured && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    backgroundColor: "#111",
                    color: "#fff",
                    marginLeft: "8px",
                    verticalAlign: "middle",
                  }}>
                  Featured
                </span>
              )}
            </h3>
            <p>{event.description}</p>
            <p>
              <strong>Date:</strong>{" "}
              {validDate
                ? date.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "To be announced"}
            </p>
            {timeRange && (
              <p>
                <strong>Time:</strong> {timeRange}
              </p>
            )}
            {event.venue && (
              <p>
                <strong>Venue:</strong> {event.venue}
              </p>
            )}
            {event.id != null && (
              <div style={{ marginTop: "12px" }}>
                <Link to={eventPath} className="btn btn-outline">
                  View Event Details →
                </Link>
              </div>
            )}
          </div>
        </article>
      </StaggerItem>
    );
  };

  return (
    <div>
      <Navbar />

      <main className="department-events-page">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: HERO_EASE }}>
          <h1>Department Events</h1>
          <p>Explore the events and activities organized by our department.</p>
        </motion.div>

        {loading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p>{error}</p>
        ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <p>No department events have been announced yet.</p>
        ) : (
          <>
            <section style={{ marginTop: "24px" }}>
              <ScrollReveal>
                <h2>Upcoming Events</h2>
              </ScrollReveal>
              {upcomingEvents.length > 0 ? (
                <StaggerGrid className="events-list" stagger={0.07}>
                  {upcomingEvents.map(renderEventCard)}
                </StaggerGrid>
              ) : (
                <p>No upcoming events scheduled at the moment.</p>
              )}
            </section>

            {pastEvents.length > 0 && (
              <section style={{ marginTop: "40px" }}>
                <ScrollReveal>
                  <h2>Past Events</h2>
                </ScrollReveal>
                <StaggerGrid className="events-list" stagger={0.07}>
                  {pastEvents.map(renderEventCard)}
                </StaggerGrid>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DepartmentEvents;
