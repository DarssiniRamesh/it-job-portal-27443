//
// Dashboard utility API functions for employer/job seeker dashboards
//

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

/**
 * PUBLIC_INTERFACE
 * Get job seeker dashboard summary (applications count, recent, recommendations).
 * @param {string} token - user JWT
 * @returns {Promise<object>} Dashboard stats object
 */
export async function getJobSeekerDashboard(token) {
  const res = await fetch(`${API_BASE}/dashboard/job_seeker`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch job seeker dashboard");
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Get employer dashboard summary (jobs posted, open, applicant stats, recents).
 * @param {string} token - user JWT
 * @returns {Promise<object>} Dashboard stats object
 */
export async function getEmployerDashboard(token) {
  const res = await fetch(`${API_BASE}/dashboard/employer`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch employer dashboard");
  return res.json();
}
