import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { getMyApplications } from "../utils/applications";

/**
 * PUBLIC_INTERFACE
 * Applications page for job seekers
 * Lists job applications submitted by the current user with status
 */
const Applications = () => {
  const { token, user, loading } = useAuth();
  const [apps, setApps] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user || user.role !== "job_seeker") return;
    setFetching(true);
    setError("");
    getMyApplications(token)
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [token, user]);

  if (loading) return <div>Loading user info...</div>;
  if (!user) return (<div><h2>Login Required</h2><p>You must be logged in as a job seeker to view your applications.</p></div>);
  if (user.role !== "job_seeker")
    return (<div><h2>Unauthorized</h2><p>This page is for job seekers only.</p></div>);

  return (
    <div style={{ maxWidth: 750, margin: "32px auto", textAlign: "left" }}>
      <h2>My Applications</h2>
      {fetching && <div>Loading your applications...</div>}
      {error && <div style={{ color: "#E87A41" }}>{error}</div>}
      {!fetching && !error && (
        <div>
          {apps && apps.length > 0 ? (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ background: "#e8eaf6" }}>
                  <th style={th}>Job Title</th>
                  <th style={th}>Status</th>
                  <th style={th}>Cover Letter</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={td}>
                      {app.job_title || app.job_id}
                    </td>
                    <td style={{ ...td, textTransform: "capitalize" }}>
                      <StatusPill status={app.status} />
                    </td>
                    <td style={td}>
                      {app.cover_letter ? <span style={{
                        display: "inline-block",
                        background: "#f8f8ec",
                        padding: "2px 7px",
                        borderRadius: 7,
                        fontSize: "93%"
                      }}>{app.cover_letter.length > 50
                        ? app.cover_letter.slice(0, 50) + "..."
                        : app.cover_letter}</span> : <i>-</i>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>You haven't applied to any jobs yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

const th = { padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: "97%", borderBottom: "2px solid #ddd" };
const td = { padding: "8px 12px", fontSize: "97%" };

function StatusPill({ status }) {
  let color = "#e0e9f7";
  let text = "#19507a";
  if (status === "accepted") { color = "#e9fbe7"; text = "#177d26"; }
  if (status === "rejected") { color = "#fbe7e7"; text = "#cc220e"; }
  if (status === "shortlisted" || status === "viewed") { color = "#f3f8fd"; text = "#0056b3"; }
  return (
    <span style={{
      background: color,
      color: text,
      borderRadius: 8,
      fontWeight: 500,
      padding: "2.5px 12px",
      display: "inline-block",
      fontSize: "94%",
      textTransform: "capitalize"
    }}>
      {status}
    </span>
  );
}
export default Applications;
