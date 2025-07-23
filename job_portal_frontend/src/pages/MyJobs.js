import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Employer's job management page: lists, creates, edits, deletes job postings and manages applications per job.
 */
const MyJobs = () => {
  const { user, token, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null); // Job object to edit or view apps
  const [formMode, setFormMode] = useState(null); // "create" || "edit" || null

  // Fetch jobs posted by this employer
  useEffect(() => {
    if (!token || !user || user.role !== "employer") return;
    setJobLoading(true);
    setError("");
    fetch(
      `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs?employer_id=${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(async (res) => {
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b?.detail || "Failed to fetch jobs");
        }
        return res.json();
      })
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setJobLoading(false));
  }, [token, user]);

  // Submit job form (create or edit)
  const handleSubmitJob = async (jobData, mode) => {
    try {
      setJobLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs`;
      let method = "POST";
      if (mode === "edit" && jobData.id) {
        url = `${url}/${jobData.id}`;
        method = "PATCH";
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.detail || "Failed to save job");
      }
      // Refresh job list
      setFormMode(null);
      setSelectedJob(null);
      // refetch jobs:
      const jobsRes = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs?employer_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(await jobsRes.json());
    } catch (err) {
      setError(err.message || "Failed to save job");
    } finally {
      setJobLoading(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job posting? This action cannot be undone.")) return;
    setJobLoading(true);
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch {
      setError("Failed to delete job");
    } finally {
      setJobLoading(false);
    }
  };

  // View applications for this job
  const handleViewApplications = (job) => {
    setSelectedJob(job);
    setFormMode("applications");
  };

  // Render
  if (loading) return <div>Loading user info...</div>;
  if (!user || user.role !== "employer")
    return (
      <div>
        <h2>Unauthorized</h2>
        <p>Only employers can manage job postings.</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", textAlign: "left" }}>
      <h2>Manage Job Postings</h2>
      {error && <div style={{ color: "#E87A41" }}>{error}</div>}
      {formMode === "create" || (formMode === "edit" && selectedJob) ? (
        <JobForm
          job={formMode === "edit" ? selectedJob : null}
          onSubmit={(data) => handleSubmitJob(data, formMode)}
          onCancel={() => {
            setFormMode(null);
            setSelectedJob(null);
          }}
        />
      ) : formMode === "applications" && selectedJob ? (
        <ApplicationsForJob
          job={selectedJob}
          token={token}
          onBack={() => {
            setFormMode(null);
            setSelectedJob(null);
          }}
        />
      ) : (
        <div>
          <button
            className="theme-toggle"
            style={{ margin: "0 0 18px 0" }}
            onClick={() => setFormMode("create")}
          >
            + Post New Job
          </button>
          {jobLoading ? (
            <div>Loading jobs...</div>
          ) : jobs && jobs.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Title</th>
                  <th style={th}>Location</th>
                  <th style={th}>Status</th>
                  <th style={th}>Applicants</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onEdit={() => {
                      setFormMode("edit");
                      setSelectedJob(job);
                    }}
                    onDelete={() => handleDeleteJob(job.id)}
                    onViewApps={() => handleViewApplications(job)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div>No jobs posted yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

const th = {
  padding: "10px 12px",
  borderBottom: "2px solid #ddd",
  fontWeight: 600,
  fontSize: "96%",
  textAlign: "left",
};

// --- Job Table Row ---
function JobRow({ job, onEdit, onDelete, onViewApps }) {
  return (
    <tr style={{ borderBottom: "1px solid #ebebeb" }}>
      <td style={td}>{job.title}</td>
      <td style={td}>{job.remote ? "Remote" : job.location}</td>
      <td style={td}>
        {/* Open/Closed - simplistic, based on presence, can adjust */}
        <span
          style={{
            background: job.closed ? "#ccc" : "#e8fbe7",
            color: job.closed ? "#222" : "#127d20",
            borderRadius: 8,
            padding: "3px 10px",
            fontWeight: 500,
            fontSize: "90%",
          }}
        >
          {job.closed ? "Closed" : "Open"}
        </span>
      </td>
      <td style={td}>
        <button
          onClick={onViewApps}
          style={{
            background: "#e8eaf6",
            color: "#2155b3",
            border: "1px solid #e9ecef",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "95%",
            padding: "3.5px 9px",
          }}
        >
          View
        </button>
      </td>
      <td style={td}>
        <button
          style={{
            background: "#e8eaf6",
            color: "#1756a8",
            border: "1px solid #e9ecef",
            borderRadius: 7,
            marginRight: 4,
            cursor: "pointer",
          }}
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          style={{
            background: "#fbe7e7",
            color: "#cc220e",
            border: "1px solid #f8b2b2",
            borderRadius: 7,
            cursor: "pointer",
          }}
          onClick={onDelete}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

const td = { padding: "8px 10px", fontSize: "97%" };

// --- Job Form Component for create/edit ---
function JobForm({ job, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    job
      ? {
          ...job,
        }
      : {
          title: "",
          description: "",
          requirements: [],
          location: "",
          company: "",
          salary_min: "",
          salary_max: "",
          remote: false,
          tags: "",
        }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  function handleChange(evt) {
    const { name, value, type, checked } = evt.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  function handleReqChange(i, v) {
    setForm((f) => {
      const arr = [...(Array.isArray(f.requirements) ? f.requirements : [])];
      arr[i] = v;
      return { ...f, requirements: arr };
    });
  }

  function addRequirement() {
    setForm((f) => ({
      ...f,
      requirements: [...(f.requirements || []), ""],
    }));
  }
  function removeRequirement(i) {
    setForm((f) => {
      const arr = [...(f.requirements || [])];
      arr.splice(i, 1);
      return { ...f, requirements: arr };
    });
  }

  function handleTagsBlur() {
    // Convert comma string to array if editing as string
    if (typeof form.tags === "string") {
      setForm((f) => ({
        ...f,
        tags: f.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const submitData = { ...form };
      // Convert tags from string for create, or leave as array for edit.
      if (typeof submitData.tags === "string")
        submitData.tags = submitData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      // Remove empty requirements
      submitData.requirements = Array.isArray(submitData.requirements)
        ? submitData.requirements.filter((v) => !!v)
        : [];
      // Remove empty salary
      if (!submitData.salary_min) delete submitData.salary_min;
      if (!submitData.salary_max) delete submitData.salary_max;
      // Remove id for creation
      if (!job) delete submitData.id;
      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      style={{
        background: "#f7f8fd",
        borderRadius: 11,
        padding: "25px 29px",
        maxWidth: 540,
        margin: "30px auto",
        border: "1px solid #dfdfef",
      }}
      onSubmit={handleSubmit}
    >
      <h3>{job ? "Edit Job" : "Post New Job"}</h3>
      {error && <div style={{ color: "#E87A41" }}>{error}</div>}
      <div style={{ marginBottom: 13 }}>
        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: 2 }}
            disabled={submitting}
          />
        </label>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>
          Company
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: 2 }}
            disabled={submitting}
          />
        </label>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>
          Location
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: 2 }}
            disabled={submitting}
          />
        </label>
        <label style={{ display: "inline-block", marginLeft: 13 }}>
          <input
            type="checkbox"
            name="remote"
            checked={!!form.remote}
            onChange={handleChange}
            disabled={submitting}
          />{" "}
          Remote
        </label>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: "100%", marginTop: 2, minHeight: 64 }}
            disabled={submitting}
          />
        </label>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>Requirements</label>
        {Array.isArray(form.requirements) && form.requirements.length
          ? form.requirements.map((req, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                <input
                  value={req}
                  onChange={(e) => handleReqChange(i, e.target.value)}
                  style={{ flex: 1 }}
                  disabled={submitting}
                />
                <button type="button" onClick={() => removeRequirement(i)} disabled={submitting}>
                  &times;
                </button>
              </div>
            ))
          : null}
        <button type="button" onClick={addRequirement} disabled={submitting}>
          + Add Requirement
        </button>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>
          Salary Min
          <input
            name="salary_min"
            type="number"
            value={form.salary_min || ""}
            onChange={handleChange}
            style={{ width: "40%", marginTop: 2, marginRight: 10 }}
            disabled={submitting}
          />
        </label>
        <label>
          Salary Max
          <input
            name="salary_max"
            type="number"
            value={form.salary_max || ""}
            onChange={handleChange}
            style={{ width: "40%", marginLeft: 10, marginTop: 2 }}
            disabled={submitting}
          />
        </label>
      </div>
      <div style={{ marginBottom: 13 }}>
        <label>
          Tags/Skills (comma separated)
          <input
            name="tags"
            value={
              Array.isArray(form.tags) ? form.tags.join(", ") : form.tags || ""
            }
            onChange={handleChange}
            onBlur={handleTagsBlur}
            style={{ width: "100%" }}
            disabled={submitting}
          />
        </label>
      </div>
      <div style={{ marginTop: 18 }}>
        <button type="submit" className="theme-toggle" disabled={submitting}>
          {submitting ? "Saving..." : job ? "Save Changes" : "Create Job"}
        </button>
        <button
          type="button"
          style={{ marginLeft: 13 }}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---- Manage Applications For Job ----
function ApplicationsForJob({ job, token, onBack }) {
  const [apps, setApps] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    // Fetch all applications for this job
    setFetching(true);
    setError("");
    fetch(
      `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/applications`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch applications");
        return res.json();
      })
      .then((data) => {
        setApps(data.filter((a) => a.job_id === job.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [job, token]);

  // Update status
  async function handleChangeStatus(appId, status) {
    // PATCH to /applications/{app_id} with {status}
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/applications/${appId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      setApps((old) =>
        old.map((a) =>
          a.id === appId
            ? {
                ...a,
                status,
              }
            : a
        )
      );
    } catch {
      window.alert("Failed to update application status.");
    }
  }

  return (
    <div style={{ margin: "28px 0" }}>
      <h3>
        Applications for: <span style={{ color: "#283fff" }}>{job.title}</span>
      </h3>
      <button onClick={onBack} style={{ marginBottom: 10 }}>
        ← Back to My Jobs
      </button>
      {fetching ? (
        <div>Loading applications...</div>
      ) : error ? (
        <div style={{ color: "#E87A41" }}>{error}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Applicant</th>
              <th style={th}>Cover Letter</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={4}>No applications for this job yet.</td>
              </tr>
            ) : (
              apps.map((app) => (
                <tr key={app.id}>
                  <td style={td}>{app.user_id}</td>
                  <td style={td}>
                    {app.cover_letter || <i>No cover letter</i>}
                  </td>
                  <td style={td}>
                    <StatusPill status={app.status} />
                  </td>
                  <td style={td}>
                    <button
                      disabled={app.status === "accepted"}
                      onClick={() => handleChangeStatus(app.id, "accepted")}
                    >
                      Accept
                    </button>{" "}
                    <button
                      disabled={app.status === "rejected"}
                      style={{
                        color: "#cc220e",
                        borderColor: "#fbe7e7",
                      }}
                      onClick={() => handleChangeStatus(app.id, "rejected")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  let color = "#e0e9f7";
  let text = "#19507a";
  if (status === "accepted") {
    color = "#e9fbe7";
    text = "#177d26";
  }
  if (status === "rejected") {
    color = "#fbe7e7";
    text = "#cc220e";
  }
  if (status === "shortlisted" || status === "viewed") {
    color = "#f3f8fd";
    text = "#0056b3";
  }
  return (
    <span
      style={{
        background: color,
        color: text,
        borderRadius: 8,
        fontWeight: 500,
        padding: "2.5px 12px",
        display: "inline-block",
        fontSize: "94%",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

export default MyJobs;
