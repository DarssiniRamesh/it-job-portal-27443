import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// -- Simple utility to parse and stringify URL query params
function useQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(location.search).entries()), [location.search]);
  const setQueryParams = useCallback(
    newParams => {
      const p = new URLSearchParams({ ...params, ...newParams });
      navigate({ search: `?${p.toString()}` });
    },
    [params, navigate]
  );
  return [params, setQueryParams];
}

/** PUBLIC_INTERFACE
 * Sidebar filter component for job search.
 * Allows entering a search query, location, toggling remote jobs, and inputting skills/tags (comma separated).
 */
function JobFilterSidebar({ filters, onChange, availableTags }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => { setLocal(filters); }, [filters]);
  // Handle input change and update local and parent
  function update(field, value) {
    const upd = { ...local, [field]: value };
    setLocal(upd);
    onChange(upd);
  }
  return (
    <div style={{
      minWidth: 220, maxWidth: 260, background: "var(--bg-secondary)",
      padding: 18, borderRadius: 10, border: "1px solid var(--border-color)", marginRight: 18
    }}>
      <h4 style={{ marginTop: 0 }}>Filter Jobs</h4>
      <div style={{ marginBottom: 10 }}>
        <input
          type="search"
          placeholder="Search (role, keywords...)"
          value={local.q || ""}
          onChange={e => update("q", e.target.value)}
          style={{ width: "100%", padding: "5px", borderRadius: 5, border: "1px solid var(--border-color)" }}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Location"
          value={local.location || ""}
          onChange={e => update("location", e.target.value)}
          style={{ width: "100%", padding: "5px", borderRadius: 5, border: "1px solid var(--border-color)" }}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: "95%" }}>
          <input
            type="checkbox"
            checked={!!local.remote}
            onChange={e => update("remote", e.target.checked)}
            style={{ marginRight: 5 }}
          />
          Remote jobs only
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Skills/Tags (comma separated)"
          value={local.tags || ""}
          onChange={e => update("tags", e.target.value)}
          style={{ width: "100%", padding: "5px", borderRadius: 5, border: "1px solid var(--border-color)" }}
        />
      </div>
    </div>
  );
}

/** PUBLIC_INTERFACE
 * List of job cards with pagination and handling "no jobs", loading, and errors.
 */
function JobList({ jobs, loading, error, page, totalPages, onPageChange, onJobClick }) {
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div style={{ color: "#E87A41" }}>{error}</div>;
  if (jobs && jobs.length === 0) return <div>No jobs found for current criteria.</div>;
  return (
    <div>
      {jobs && jobs.map(job => (
        <JobCard key={job.id} job={job} onClick={onJobClick} />
      ))}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

/** PUBLIC_INTERFACE
 * Represents a single job listing as a card.
 */
function JobCard({ job, onClick }) {
  return (
    <div
      onClick={() => onClick(job.id)}
      style={{
        border: "1px solid var(--border-color)",
        padding: 16, borderRadius: 10,
        margin: "16px 0", background: "white",
        cursor: "pointer", transition: "box-shadow 0.15s",
        boxShadow: "0 2px 4px rgba(24,40,70,0.05)"
      }}
      tabIndex={0}
      onKeyPress={e => { if (e.key === "Enter" || e.key === " ") onClick(job.id); }}
      role="button"
      aria-label={`View job ${job.title} at ${job.company}`}
    >
      <div style={{ fontWeight: 700, fontSize: "1.23em", color: "#1a237e" }}>
        {job.title}
      </div>
      <div style={{ color: "#666", fontSize: "97%", margin: "2px 0 6px 0" }}>
        {job.company} {job.remote && <span style={{
          color: "#148766",
          marginLeft: 6, background: "#e0f7fa", fontSize: "87%", padding: "2px 7px",
          borderRadius: 7
        }}>Remote</span>}
      </div>
      <div style={{ fontSize: "95%" }}>
        <span style={{ color: "#888" }}>{job.location}</span>
        {Array.isArray(job.tags) && job.tags.length > 0 &&
          <span style={{ marginLeft: 10 }}>
            {job.tags.map(tag => (
              <span key={tag} style={{
                display: "inline-block", background: "#f3f6fd", color: "#254089", fontSize: "85%",
                borderRadius: "8px", padding: "1.5px 7px", margin: "0 2px"
              }}>
                {tag}
              </span>
            ))}
          </span>
        }
      </div>
      <div style={{
        marginTop: 10, color: "#333", fontSize: "97%", minHeight: 32,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
      }}>
        {job.description}
      </div>
      <div style={{ marginTop: 10, color: "#888", fontSize: "91%" }}>
        {job.salary_min || job.salary_max
          ? <>Salary: {job.salary_min ? "$" + job.salary_min : "?"} - {job.salary_max ? "$" + job.salary_max : "?"}</>
          : null}
      </div>
    </div>
  );
}

/** PUBLIC_INTERFACE
 * Pagination controls - numbered buttons for navigation.
 */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  let visible = [];
  for (let x = Math.max(1, page - 2); x <= Math.min(totalPages, page + 2); ++x) visible.push(x);
  return (
    <div style={{ margin: "21px 0", textAlign: "center" }}>
      <button style={pagBtnStyle} disabled={page === 1} onClick={() => onPageChange(page - 1)}>&lt;</button>
      {visible[0] > 1 && <> ... </>}
      {visible.map(num =>
        <button key={num} style={{ ...pagBtnStyle, fontWeight: num === page ? 700 : 400 }} disabled={num === page} onClick={() => onPageChange(num)}>
          {num}
        </button>
      )}
      {visible[visible.length - 1] < totalPages && <> ... </>}
      <button style={pagBtnStyle} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>&gt;</button>
    </div>
  );
}
const pagBtnStyle = { margin: "0 3px", border: "1px solid #d0d5e7", background: "#f8fafd", borderRadius: 5, padding: "2px 10px", cursor: "pointer" };

// --- Main Jobs Page Component ---
/**
 * PUBLIC_INTERFACE
 * List/search jobs page.
 * Renders sidebar filter, job list, handles backend integration for job fetching.
 */
const Jobs = () => {
  // Filters: q, location, remote, tags; Pagination: page, limit
  const [queryParams, setQueryParams] = useQueryParams();
  const [filters, setFilters] = useState({
    q: queryParams.q || "",
    location: queryParams.location || "",
    remote: queryParams.remote === "true",
    tags: queryParams.tags || "",
    page: Number(queryParams.page) || 1,
    limit: 10,
  });
  const [jobs, setJobs] = useState([]);
  const [jobCount, setJobCount] = useState(null); // If backend gives count
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTags] = useState([]); // Could fetch from backend later

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const totalPages = useMemo(() => jobCount ? Math.ceil(jobCount / limit) : (jobs.length === limit ? page + 1 : page), [jobCount, jobs.length, page, limit]);

  // Debounce filter/search update to avoid too many API calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQueryParams({
        q: filters.q,
        location: filters.location,
        remote: filters.remote,
        tags: filters.tags,
        page: filters.page,
      });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [filters.q, filters.location, filters.remote, filters.tags, filters.page]);

  // Update filters when URL changes (i.e. from browser nav)
  useEffect(() => {
    setFilters({
      q: queryParams.q || "",
      location: queryParams.location || "",
      remote: queryParams.remote === "true",
      tags: queryParams.tags || "",
      page: Number(queryParams.page) || 1,
      limit: 10,
    });
    // eslint-disable-next-line
  }, [location.search]); // update if search part of URL changes

  // Actually fetch jobs list from backend
  useEffect(() => {
    setLoading(true);
    setError("");
    // Backend expects: /jobs?q=...&location=...&remote=...&tags=...&skip=...&limit=...
    const prms = [];
    if (filters.q) prms.push("q=" + encodeURIComponent(filters.q));
    if (filters.location) prms.push("location=" + encodeURIComponent(filters.location));
    if (filters.remote) prms.push("remote=true");
    // Support tags as a comma-separated list in URL
    if (filters.tags) {
      for (const t of filters.tags.split(",").map(s => s.trim()).filter(Boolean)) {
        prms.push("tags=" + encodeURIComponent(t));
      }
    }
    prms.push("skip=" + ((page - 1) * limit));
    prms.push("limit=" + limit);
    const url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/jobs?${prms.join("&")}`;

    fetch(url)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || "Failed to load jobs");
        }
        return res.json();
      })
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        // The backend API returns an array; if count is also returned, setJobCount here!
        // e.g. { jobs: [...], count: ... } If so, adjust accordingly
        setJobCount(null); // use jobs.length - unless API adds explicit count
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters.q, filters.location, filters.remote, filters.tags, page, limit]);

  const handleFilterChange = upd => {
    setFilters(f => ({ ...f, ...upd, page: 1 }));
  };
  const handlePageChange = pg => {
    setFilters(f => ({ ...f, page: pg }));
  };
  const navigate = useNavigate();
  const handleJobClick = id => {
    navigate(`/jobs/${id}`);
  };

  // Responsive flex/column for sidebar + jobs list
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 15,
      padding: "30px 0", maxWidth: 1100, margin: "0 auto"
    }}>
      <JobFilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        availableTags={availableTags}
      />
      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ margin: "0 0 15px 0" }}>Job Listings</h2>
        <JobList
          jobs={jobs}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onJobClick={handleJobClick}
        />
      </div>
    </div>
  );
};

export default Jobs;
