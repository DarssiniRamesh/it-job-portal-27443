# API Utility

## Overview

This centralized API utility for the IT Job Portal frontend (React) provides:

- Consistent HTTP request/response handling (GET, POST, PATCH, DELETE).
- Automatic Authorization header inclusion (JWT token) with fallback to AuthContext/localStorage.
- Standardized error mapping to user-friendly messages (network/server/API errors).
- Simplified API call interface for feature code and page components.
- Handles both JSON and raw body requests.
- Global friendly error reporting with `getFriendlyApiError`.

## Usage

```js
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

const { token } = useAuth();
const jobs = await api.get("/jobs", { token });
// or
try {
  const user = await api.get("/users/me", { token });
} catch (err) {
  const msg = api.getFriendlyApiError(err); // safe for UI feedback
}
```

## Features

- Handles absolute/relative URLs
- Returns JSON (parsed) whenever available, or raw text for non-JSON results
- Throws `Error` with a friendly message for non-2xx responses (including backend error detail)
- Handles 401/403/404/500-specific messages for better UX
- Integrates cleanly into AuthContext or ad-hoc API calls

## Functions

- `api.request(path, opts)`: Main API call (advanced usage)
- `api.get(path, {token, headers})`
- `api.post(path, body, {token, headers})`
- `api.patch(path, body, {token, headers})`
- `api.delete(path, [body], {token, headers})`
- `api.getFriendlyApiError(error)`: Get human-friendly error message for display

**Token is optional** if already set by AuthContext and stored via utils/auth.

---

## Integration

Replace most direct usages of `fetch` or duplicate error handling in utility files/pages with `api.get`, `api.post` etc. for standard error management and auth replay.

You may combine this with page-level or global error notifications (e.g., via modals, banners, or toasts) for improved user experience.
