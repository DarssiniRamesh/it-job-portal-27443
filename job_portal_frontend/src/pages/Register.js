import React, { useState } from "react";
import { register as registerApi } from "../utils/auth";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Register page.
 */
const Register = () => {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "job_seeker"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = evt => {
    const { name, value } = evt.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await registerApi(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: "30px auto", textAlign: "left" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Full Name<br />
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              autoFocus
              style={{ width: "100%" }}
              disabled={submitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Email<br />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
              disabled={submitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>
            Password<br />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{ width: "100%" }}
              disabled={submitting}
            />
          </label>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>User Role<br />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ width: "100%" }}
              disabled={submitting}
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </label>
        </div>
        {error && <div style={{ color: "#E87A41", marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: "#0056b3", marginBottom: 10 }}>Registration successful! Redirecting...</div>}
        <button type="submit" className="theme-toggle" disabled={submitting} style={{ marginTop: 10 }}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
