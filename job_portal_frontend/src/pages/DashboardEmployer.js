import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Dashboard for employers.
 * Shows stats, jobs posted, applicant summaries, and allows managing job activity.
 */
const DashboardEmployer = () => {
  const { token, user, loading } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [fetching, setFetching] = useState(!dashboard);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/dashboard/employer`, {
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
  if (!user || user.role !== "employer") {
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
          display: "inline-block", background: "#ffb30022", padding: "0.2em 0.7em",
          borderRadius: 10, margin: "4px 0", fontSize: "90%"
        }}>
          Role: {user.role}
        </span>
      </div>
      <hr style={{ margin: "15px 0" }} />
      <h3>Employer Dashboard Summary</h3>
      {fetching && <div>Loading dashboard data...</div>}
      {dashboardError && <div style={{ color: "#E87A41" }}>{dashboardError}</div>}
      {dashboard && (
        <div>
          {"jobs_posted" in dashboard && (
            <div>
              <b>Jobs Posted:</b> {dashboard.jobs_posted}
            </div>
          )}
          {"open_positions" in dashboard && (
            <div>
              <b>Open Positions:</b> {dashboard.open_positions}
            </div>
          )}
          {"total_applicants" in dashboard && (
            <div>
              <b>Total Applicants:</b> {dashboard.total_applicants}
            </div>
          )}
          {"recent_jobs" in dashboard && Array.isArray(dashboard.recent_jobs) && dashboard.recent_jobs.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <u>Recent Posted Jobs:</u>
              <ul>
                {dashboard.recent_jobs.map(job => (
                  <li key={job.id}>
                    {job.title} {" ("}{job.location}{")"}
                    {" – "}
                    <b>Applicants:</b> {job.applicants_count || 0}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <hr style={{ margin: "16px 0" }} />
      <div style={{ margin: "10px 0" }}>
        <a className="App-link" href="/post-job">
          Post a new job &rarr;
        </a>
      </div>
      <div style={{ margin: "10px 0" }}>
        <a className="App-link" href="/jobs">View all job postings</a>
      </div>
      <div style={{ margin: "10px 0" }}>
        <a className="App-link" href="/profile">Edit my profile</a>
      </div>
    </div>
  );
};

export default DashboardEmployer;
