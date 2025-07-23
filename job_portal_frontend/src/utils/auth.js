//
// Authentication utilities: handle API calls, token, and user info management.
//

// Backend API root - (Update if deployed/back URL changes)
const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// PUBLIC_INTERFACE
/**
 * Login user by posting credentials to backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: email,
      password: password
    }),
  });
  if (!res.ok) {
    throw new Error(res.status === 401 ? "Incorrect email or password" : "Login failed");
  }
  return await res.json(); // { access_token, token_type }
}

// PUBLIC_INTERFACE
/**
 * Register a new user via backend.
 * @param {Object} param0 - Registration fields: email, full_name, role, password
 * @returns {Promise<object>} user object as returned by API
 */
export async function register({ email, full_name, role, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name, role, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Registration failed");
  }
  return await res.json();
}

// PUBLIC_INTERFACE
/**
 * Get the authenticated user profile from backend.
 * Requires Authorization header.
 * @param {string} token
 * @returns {Promise<object>} user object
 */
export async function getMe(token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

/**
 * Save token to localStorage.
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  }
}

/**
 * Remove token from localStorage.
 */
export function clearToken() {
  localStorage.removeItem("access_token");
}

/**
 * Get token from localStorage.
 */
export function getToken() {
  return localStorage.getItem("access_token");
}
