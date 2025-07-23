/**
 * Centralized API utility for HTTP communication.
 * Handles:
 *  - Authorization token injection via AuthContext
 *  - Global error handling and user-friendly messages
 *  - Unified fetch API usage with optional JSON request/response support
 *  - Response validation and parsing
 *  - Exposes helpers for GET, POST, PATCH, DELETE requests
 *
 * Usage Example:
 *   import api from "./api";
 *   const data = await api.get("/jobs", { token });
 */

import { getToken } from "./auth";

/**
 * Map HTTP/network errors to friendly messages.
 * @param {Response} res
 * @param {string} fallback
 */
function extractErrorMessage(res, fallback) {
  if (!res) return fallback;
  if (typeof res === "string") return res;
  if (typeof res === "object" && "message" in res) return res.message;
  if (typeof res === "object" && "detail" in res) return res.detail;
  return fallback;
}

// PUBLIC_INTERFACE
/**
 * Central API function handling HTTP requests.
 * @param {string} path (relative or absolute)
 * @param {object} options (method, body, token etc.)
 * @returns {Promise<any>} data (throws Error on failure)
 */
export async function apiRequest(path, options = {}) {
  let url = path.startsWith("http") ? path :
    `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = options.token || getToken();
  const headers = {
    ...(options.json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    // Build fetch config:
    const config = {
      method: options.method || "GET",
      headers,
      ...(options.body !== undefined
        ? { body: options.json ? JSON.stringify(options.body) : options.body }
        : {}),
    };

    const res = await fetch(url, config);

    // Try to parse error details if present:
    let responseData;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      responseData = await res.json().catch(() => undefined);
    } else {
      responseData = await res.text().catch(() => undefined);
    }

    if (!res.ok) {
      let errorMessage =
        extractErrorMessage(responseData, res.statusText || "Request failed");
      // Add status code to message for severe errors
      if (res.status >= 500)
        errorMessage = "Server Error: " + (errorMessage || res.statusText);
      else if (res.status === 401)
        errorMessage = "Authentication required. Please log in again.";
      else if (res.status === 403)
        errorMessage = "You are not authorized to perform this action.";
      else if (res.status === 404 && !errorMessage)
        errorMessage = "Resource not found (404).";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (err) {
    if (err instanceof Error) {
      // Human-friendly fallback for network/parse errors
      if (
        err.message === "Failed to fetch" ||
        err.message.startsWith("NetworkError")
      )
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      throw err;
    }
    throw new Error("Unknown error occurred while fetching data.");
  }
}

// PUBLIC_INTERFACE
/**
 * Shortcut: GET request
 * @param {string} path
 * @param {object} { token, ... }
 */
export function apiGet(path, { token, headers } = {}) {
  return apiRequest(path, { method: "GET", token, headers });
}

// PUBLIC_INTERFACE
/**
 * Shortcut: POST request with JSON body
 * @param {string} path
 * @param {object} body
 * @param {object} { token, headers }
 */
export function apiPost(path, body, { token, headers } = {}) {
  return apiRequest(path, {
    method: "POST",
    body,
    json: true,
    token,
    headers,
  });
}

// PUBLIC_INTERFACE
/**
 * Shortcut: PATCH request with JSON body
 * @param {string} path
 * @param {object} body
 * @param {object} { token, headers }
 */
export function apiPatch(path, body, { token, headers } = {}) {
  return apiRequest(path, {
    method: "PATCH",
    body,
    json: true,
    token,
    headers,
  });
}

// PUBLIC_INTERFACE
/**
 * Shortcut: DELETE request (optionally with body)
 * @param {string} path
 * @param {object} [body]
 * @param {object} { token, headers }
 */
export function apiDelete(path, body, { token, headers } = {}) {
  return apiRequest(path, {
    method: "DELETE",
    ...(body ? { body, json: true } : {}),
    token,
    headers,
  });
}

// PUBLIC_INTERFACE
/**
 * Returns a user-friendly description for a given API/network error.
 * To integrate with page-level error displays.
 * @param {Error|string} error
 */
export function getFriendlyApiError(error) {
  if (!error) return "";
  if (typeof error === "object" && "message" in error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

// Re-export as default object for easy import
const api = {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
  getFriendlyApiError,
};

export default api;
