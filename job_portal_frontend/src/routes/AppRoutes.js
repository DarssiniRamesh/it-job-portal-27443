import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardSeeker from "../pages/DashboardSeeker";
import DashboardEmployer from "../pages/DashboardEmployer";
import Jobs from "../pages/Jobs";
import JobDetail from "../pages/JobDetail";
import Profile from "../pages/Profile";
import Applications from "../pages/Applications";
import PostJob from "../pages/PostJob";

/**
 * PUBLIC_INTERFACE
 * Main application routing configuration.
 * Handles all key pages in the Job Portal.
 */
const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard/seeker" element={<DashboardSeeker />} />
      <Route path="/dashboard/employer" element={<DashboardEmployer />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/post-job" element={<PostJob />} />
    </Routes>
  </Router>
);

export default AppRoutes;
