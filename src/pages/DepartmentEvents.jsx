import { useEffect, useState } from "react";
import { getApiUrl } from "../lib/api";
import "./DepartmentEvents.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DepartmentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(getApiUrl("/api/content"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load department events");
        }

        const data = await response.json();
        const savedEvents = data?.content?.["department.events"];

        setEvents(Array.isArray(savedEvents) ? savedEvents : []);
      } catch (error) {
        console.error("Error loading department events:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div>
      <Navbar />

      <main className="department-events-page">
        <h1>Department Events</h1>
        <p>Explore the events and activities organized by our department.</p>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <div className="events-list">
            {events.map((event, index) => {
              const date = event.date
                ? new Date(`${event.date}T00:00:00`)
                : null;

              const validDate = date && !Number.isNaN(date.getTime());

              return (
                <article className="event" key={event.id ?? index}>
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
                    <h3>{event.title}</h3>
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
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>No department events have been announced yet.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DepartmentEvents;
