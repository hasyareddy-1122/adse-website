import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import App from "./App.jsx";
import { logout, isLoggedIn } from "./lib/api.js";
import "./index.css";

function SessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);

      if (!isLoggedIn()) return;

      timeoutId = setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, INACTIVITY_LIMIT);
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SessionManager />
    </BrowserRouter>
  </StrictMode>,
);
