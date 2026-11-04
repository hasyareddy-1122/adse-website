import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Newsletter from "./pages/Newsletter";
import Caads from "./pages/Caads";
import FacultyDev from "./pages/FacultyDev";
import IndustrialVisit from "./pages/IndustrialVisit";
import ServiceLearning from "./pages/ServiceLearning";
import FacultyDetail from "./pages/FacultyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import DepartmentEvents from "./pages/DepartmentEvents";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="/caads" element={<Caads />} />
      <Route path="/faculty-dev" element={<FacultyDev />} />
      <Route path="/industrial-visit" element={<IndustrialVisit />} />
      <Route path="/service-learning" element={<ServiceLearning />} />
      <Route path="/faculty" element={<FacultyDetail />} />
      <Route path="/department-events" element={<DepartmentEvents />} />

      {/* Auth + portal */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
