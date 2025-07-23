//
// Utility API functions for job applications (apply, list, manage)
//

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

/**
 * PUBLIC_INTERFACE
 * Get all job applications submitted by the current user (job seeker).
 * @param {string} token - JWT auth token
 * @returns {Promise<Array>} - List of applications with job and status info
 */
export async function getMyApplications(token) {
  const res = await fetch(`${API_BASE}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Submit an application to a job as a job seeker.
 * @param {string} token - JWT
 * @param {object} data - { job_id, user_id, cover_letter }
 * @returns {Promise<object>} Created application
 */
export async function applyToJob(token, data) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Application failed");
  }
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Get all applications submitted to a specific job (for employer managing a job).
 * @param {string} token
 * @param {number} job_id
 * @returns {Promise<Array>}
 */
export async function getApplicationsForJob(token, job_id) {
  // No direct /jobs/{job_id}/applications endpoint;
  // Employers get applicant list from their dashboard (not via public API here); can filter from /applications or fetch all jobs and then applications.
  // For this app, we will fetch all applications via /applications, then filter by job_id for employers.
  const res = await fetch(`${API_BASE}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch applications");
  const all = await res.json();
  return all.filter(app => app.job_id === job_id);
}

/**
 * PUBLIC_INTERFACE
 * Update an application (accept/reject/shortlist etc.)
 * Only employer owning the job can do this.
 * @param {string} token
 * @param {number} app_id
 * @param {object} data - e.g., { status: "accepted" }
 * @returns {Promise<object>}
 */
export async function updateApplicationStatus(token, app_id, data) {
  const res = await fetch(`${API_BASE}/applications/${app_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Failed to update status");
  }
  return res.json();
}
