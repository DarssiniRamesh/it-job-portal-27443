import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { useAuth } from "../utils/AuthContext";

/**
 * RoleProtectedDashboard - redirects user to their dashboard if authorized, else login.
 */
function RoleProtectedDashboard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading authentication...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== user.role)
    return (
      <div>
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this dashboard.</p>
      </div>
    );
  return children;
}

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
      <Route
        path="/dashboard/seeker"
        element={
          <RoleProtectedDashboard role="job_seeker">
            <DashboardSeeker />
          </RoleProtectedDashboard>
        }
      />
      <Route
        path="/dashboard/employer"
        element={
          <RoleProtectedDashboard role="employer">
            <DashboardEmployer />
          </RoleProtectedDashboard>
        }
      />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/post-job" element={<PostJob />} />
    </Routes>
  </Router>
);

export default AppRoutes;
