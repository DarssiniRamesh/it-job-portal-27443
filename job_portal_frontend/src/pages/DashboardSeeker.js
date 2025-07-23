import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Dashboard for job seekers: displays stats, recent applications, and welcome.
 */
const DashboardSeeker = () => {
  const { token, user, loading } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [fetching, setFetching] = useState(!dashboard);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/dashboard/job_seeker`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || "Failed to load dashboard");
        }
        return res.json();
      })
      .then(setDashboard)
      .catch(e => setDashboardError(e.message))
      .finally(() => setFetching(false));
  }, [token]);

  if (loading) {
    return <div>Loading user info...</div>;
  }
  if (!user || user.role !== "job_seeker") {
    return (
      <div>
        <h2>Unauthorized</h2>
        <p>You do not have permission to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "30px auto", textAlign: "left" }}>
      <h2>Welcome, {user.full_name}!</h2>
      <div style={{ margin: "16px 0" }}>
        <b>Email:</b> {user.email}<br />
        <span style={{
          display: "inline-block", background: "#e8eaf6", padding: "0.2em 0.7em",
          borderRadius: 10, margin: "4px 0", fontSize: "90%"
        }}>
          Role: {user.role}
        </span>
      </div>
      <hr style={{ margin: "15px 0" }} />
      <h3>Dashboard Summary</h3>
      {fetching && <div>Loading dashboard data...</div>}
      {dashboardError && <div style={{ color: "#E87A41" }}>{dashboardError}</div>}
      {dashboard && (
        <div>
          {"applications_count" in dashboard && (
            <div>
              <b>Applications Submitted:</b> {dashboard.applications_count}
            </div>
          )}
          {"active_applications" in dashboard && (
            <div>
              <b>Active Applications:</b> {dashboard.active_applications}
            </div>
          )}
          {"interview_invites" in dashboard && (
            <div>
              <b>Interview Invites:</b> {dashboard.interview_invites}
            </div>
          )}
          {"recent_applications" in dashboard && Array.isArray(dashboard.recent_applications) && dashboard.recent_applications.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <u>Recent Applications:</u>
              <ul>
                {dashboard.recent_applications.map(app => (
                  <li key={app.id}>
                    {app.job_title ? app.job_title : "Job ID: " + app.job_id}
                    {" — "} <b>Status:</b> {app.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <hr style={{ margin: "16px 0" }} />
      <div style={{ margin: "10px 0" }}>
        <a className="App-link" href="/applications">
          View all my applications &rarr;
        </a>
      </div>
      <div style={{ margin: "10px 0" }}>
        <a className="App-link" href="/profile">Edit my profile</a>
      </div>
    </div>
  );
};

export default DashboardSeeker;
