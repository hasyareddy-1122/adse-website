import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import OptimizedImage from "../components/OptimizedImage.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ScrollReveal } from "../components/MotionPrimitives";
import { getApiUrl } from "../lib/api";
import "./DepartmentEvents.css";

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

export default function EventDetail() {
  const { id } = useParams();
  const cleanId = id ? String(id).replace(/^:/, "") : "";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSingleEvent() {
      if (!cleanId) {
        setError("Invalid event link.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const directRes = await fetch(
          getApiUrl(`/api/events/${encodeURIComponent(cleanId)}`),
          { cache: "no-store" },
        );

        if (directRes.ok) {
          const directData = await directRes.json();
          const found = directData?.event ?? directData;
          if (!cancelled && found && (found.id != null || found.title)) {
            setEvent(found);
            setLoading(false);
            return;
          }
        }

        const listRes = await fetch(getApiUrl("/api/events"), {
          cache: "no-store",
        });
        if (!listRes.ok) {
          throw new Error("Failed to load event details.");
        }

        const listData = await listRes.json();
        const eventsList = Array.isArray(listData?.events)
          ? listData.events
          : [];
        const matched = eventsList.find(
          (item) => String(item.id) === String(cleanId),
        );

        if (!cancelled) {
          if (matched) {
            setEvent(matched);
          } else {
            setError("Event not found.");
          }
        }
      } catch (err) {
        console.error("Error loading event detail:", err);
        if (!cancelled) {
          setError("Unable to load event details right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSingleEvent();

    return () => {
      cancelled = true;
    };
  }, [cleanId]);

  const date = event?.eventDate ? new Date(event.eventDate) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const resolvedImg = resolveEventImageUrl(event?.imageUrl);
  const timeRange = formatEventTimeRange(event?.startTime, event?.endTime);

  return (
    <div>
      <Navbar />

      <main className="department-events-page">
        <div style={{ marginBottom: "20px" }}>
          <Link to="/department-events" className="btn btn-outline">
            ← Back to Department Events
          </Link>
        </div>

        {loading ? (
          <p>Loading event details...</p>
        ) : error || !event ? (
          <ScrollReveal>
            <div className="event-details">
              <h2>Event Unavailable</h2>
              <p>{error || "The requested event could not be found."}</p>
            </div>
          </ScrollReveal>
        ) : (
          <motion.article
            className="event-details"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: HERO_EASE }}>
            {resolvedImg && (
              <OptimizedImage
                src={resolvedImg}
                alt={event.title}
                style={{
                  width: "100%",
                  maxHeight: "460px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}
              />
            )}

            <h1>
              {event.title}{" "}
              {event.isFeatured && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: "#111",
                    color: "#fff",
                    marginLeft: "10px",
                    verticalAlign: "middle",
                  }}>
                  Featured
                </span>
              )}
            </h1>

            <div style={{ margin: "16px 0" }}>
              <p>
                <strong>Date:</strong>{" "}
                {validDate
                  ? date.toLocaleDateString("en-US", {
                      weekday: "long",
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
            </div>

            <p style={{ whiteSpace: "pre-line" }}>{event.description}</p>
          </motion.article>
        )}
      </main>

      <Footer />
    </div>
  );
}
