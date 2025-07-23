import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Job detail page for a specific job.
 * Fetches job details from backend and displays data.
 */
const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs/${jobId}`)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || "Job not found");
        }
        return res.json();
      })
      .then(setJob)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div>Loading job details...</div>;
  if (error) return <div style={{ color: "#E87A41" }}>{error}</div>;
  if (!job) return <div>No job found for ID {jobId}.</div>;

  return (
    <div style={{
      maxWidth: 700, margin: "30px auto", background: "white",
      borderRadius: 14, padding: "30px 32px", border: "1px solid var(--border-color)",
      boxShadow: "0 2px 7px 0 rgba(34,42,84,0.07)"
    }}>
      <div style={{ fontSize: "2em", fontWeight: 700, color: "#1a237e", marginBottom: 8 }}>
        {job.title}
      </div>
      <div style={{ fontWeight: 500, color: "#444", marginBottom: 6 }}>
        {job.company} – <span style={{
          color: "#276", background: "#e0f7fa", fontSize: "90%", borderRadius: 8, padding: "1px 8px"
        }}>{job.remote ? "Remote" : job.location}</span>
      </div>
      <div>
        {Array.isArray(job.tags) && job.tags.length > 0 && (
          <div style={{ marginBottom: 8 }}>{job.tags.map(t =>
            <span key={t} style={{
              display: "inline-block", background: "#f4f7ff", color: "#254089", fontSize: "88%",
              borderRadius: "8px", padding: "2.5px 9px", marginRight: 5
            }}>{t}</span>
          )}</div>
        )}
      </div>
      <div style={{ fontSize: "1.1em", margin: "20px 0 18px 0", color: "#333" }}>
        {job.description}
      </div>
      {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
        <div>
          <b>Requirements:</b>
          <ul>
            {job.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
          </ul>
        </div>
      )}
      <div style={{ margin: "16px 0", color: "#666" }}>
        <b>Salary:</b> {job.salary_min ? "$" + job.salary_min : "?"} – {job.salary_max ? "$" + job.salary_max : "?"}
      </div>
      <div style={{ margin: "16px 0" }}>
        <b>Company:</b> {job.company}
      </div>
      <a
        className="App-link"
        href="/applications"
        style={{ marginTop: 14, display: "inline-block" }}
      >
        Apply for this Job &rarr;
      </a>
      <div style={{ marginTop: 18 }}>
        <a className="App-link" href="/jobs">&larr; Back to jobs list</a>
      </div>
    </div>
  );
};

export default JobDetail;
