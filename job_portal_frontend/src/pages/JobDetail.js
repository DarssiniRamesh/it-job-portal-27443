import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { getMyApplications, applyToJob } from "../utils/applications";

/**
 * PUBLIC_INTERFACE
 * Job detail page for a specific job.
 * Fetches job details from backend and displays data.
 */
const JobDetail = () => {
  const { jobId } = useParams();
  const { token, user, loading: userLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applyStatus, setApplyStatus] = useState(""); // success/error message
  const [isApplying, setIsApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(null); // null=unchecked, {} if present
  const [coverLetter, setCoverLetter] = useState("");

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

  // Check if user has already applied
  useEffect(() => {
    if (!token || !user || !job || user.role !== "job_seeker") return;
    getMyApplications(token)
      .then(apps => {
        const found = apps.find(a => String(a.job_id) === String(job.id));
        setAlreadyApplied(found || false);
      })
      .catch(() => setAlreadyApplied(false));
  }, [token, user, job]);

  // "Apply" form submit handler
  async function handleApply(e) {
    e.preventDefault();
    if (!user || user.role !== "job_seeker" || !token) return;
    setIsApplying(true);
    setApplyStatus("");
    try {
      await applyToJob(token, {
        job_id: job.id,
        user_id: user.id,
        cover_letter: coverLetter
      });
      setApplyStatus("success");
      setAlreadyApplied({ job_id: job.id, status: "submitted", cover_letter: coverLetter });
    } catch (e) {
      setApplyStatus("error:" + e.message);
    } finally {
      setIsApplying(false);
    }
  }

  if (loading || userLoading) return <div>Loading job details...</div>;
  if (error) return <div style={{ color: "#E87A41" }}>{error}</div>;
  if (!job) return <div>No job found for ID {jobId}.</div>;

  // Hide apply form for employers/admins/anon or show status for seekers
  let applicationUI = null;
  if (!user) {
    applicationUI = (
      <div style={{ marginTop: 20 }}>
        <a className="App-link" href="/login">Login to apply for this job</a>
      </div>
    );
  } else if (user.role === "employer") {
    applicationUI = (
      <div style={{ marginTop: 22, color: "#888" }}>
        Employers cannot apply to jobs.
      </div>
    );
  } else if (user.role === "job_seeker") {
    // Already applied?
    if (alreadyApplied && alreadyApplied !== false) {
      applicationUI = (
        <div style={{
          background: "#e8f8ea", color: "#1C6B39", padding: "12px 18px", borderRadius: 11,
          border: "1px solid #e1ecdd", marginTop: 25
        }}>
          <b>You have already applied for this job.</b>
          <div>Status: <StatusPill status={alreadyApplied.status || "submitted"} /></div>
          {alreadyApplied && Object.prototype.hasOwnProperty.call(alreadyApplied, "cover_letter") && alreadyApplied.cover_letter ? (
            <div>
              <b>Your Cover Letter:</b>
              <div style={{ background: "#f7fff6", borderRadius: 8, padding: "5px 10px", marginTop: 2 }}>
                {alreadyApplied.cover_letter}
              </div>
            </div>
          ) : null}
        </div>
      );
    } else {
      applicationUI = (
        <form onSubmit={handleApply}
          style={{
            marginTop: 24,
            padding: "16px 15px",
            border: "1px solid #ccdfd8",
            borderRadius: 9,
            background: "#f7fdf8"
          }}>
          <div>
            <b>Apply Now:</b>
            <textarea
              style={{
                display: "block",
                width: "100%",
                minHeight: 66,
                marginTop: 8,
                borderRadius: 7,
                fontSize: "97%",
                border: "1px solid #e0dbc3",
                padding: "7px"
              }}
              placeholder="Optional: Write a brief cover letter..."
              value={coverLetter}
              disabled={isApplying}
              onChange={e => setCoverLetter(e.target.value)}
              maxLength={400}
            />
          </div>
          <button
            className="theme-toggle"
            disabled={isApplying}
            type="submit"
            style={{ marginTop: 14 }}>
            {isApplying ? "Applying..." : "Apply for this job"}
          </button>
          {applyStatus === "success" && (
            <div style={{ color: "#177d26", marginTop: 10 }}>Application submitted successfully!</div>
          )}
          {applyStatus.startsWith("error:") && (
            <div style={{ color: "#E87A41", marginTop: 10 }}>{applyStatus.replace("error:", "")}</div>
          )}
        </form>
      );
    }
  }

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
      {/* Application area */}
      <div style={{ marginTop: 16 }}>
        {applicationUI}
      </div>
      <div style={{ marginTop: 18 }}>
        <a className="App-link" href="/jobs">&larr; Back to jobs list</a>
      </div>
    </div>
  );
};

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

export default JobDetail;
