import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../utils/auth";
import { useAuth } from "../utils/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Login page.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const resp = await loginApi(email, password);
      login(resp.access_token);
      setSubmitting(false);
      // After login, direct to generic dashboard (could refine by role)
      navigate("/dashboard/seeker");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "30px auto", textAlign: "left" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Email<br />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              style={{ width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Password<br />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ width: "100%" }}
            />
          </label>
        </div>
        {error && <div style={{ color: "#E87A41", marginBottom: 10 }}>{error}</div>}
        <button type="submit" className="theme-toggle" disabled={submitting} style={{ marginTop: 10 }}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
