# IT Job Portal Frontend

This is the **React** frontend for the IT Job Portal application. It enables job seekers and employers to register, post/search jobs, manage applications, and view dashboards with a clean, modern UI.

## Major Features

- User Registration & Login (with JWT-based auth)
- View/add/edit job postings (employers) and search jobs (seekers)
- Submit and track job applications (job seekers)
- Dashboards for both employers & seekers
- Profile management
- Responsive, minimalistic UI without heavy UI frameworks

## Project Structure

- `src/pages/` – All main page components (`Login`, `Register`, `Jobs`, `DashboardEmployer`, `DashboardSeeker`, etc.)
- `src/utils/` – API calls (`api.js`), authentication context (`AuthContext.js`), and dashboard/utilities
- `src/routes/AppRoutes.js` – Route configuration
- `src/App.js` – Application entry, theme toggle, authentication provider

## Getting Started

1. **Clone the repo & enter the frontend directory:**
    ```sh
    git clone <repo-url>
    cd it-job-portal-27443/job_portal_frontend
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Configure environment variables (if needed):**
   - The API base URL may be configured inside `src/utils/api.js` or via `.env` with the standard React convention.
   - Example:
        ```env
        REACT_APP_API_BASE_URL=http://localhost:8000
        ```
   - By default, the frontend assumes the backend runs on `http://localhost:8000`.

4. **Start the development server:**
    ```sh
    npm start
    ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment & Build

- **Production build:**  
    ```sh
    npm run build
    ```
    Bundles the app into the `build` directory.
- **Deployment:**
    - Serve with any static file server (e.g. Netlify, Vercel, AWS S3 + CloudFront, or Node serve).
    - No special requirements except correct `REACT_APP_API_BASE_URL`.

## API Integration

The frontend communicates with the backend REST API described in the [OpenAPI spec](../../it-job-portal-27444/job_portal_backend/interfaces/openapi.json):

- See backend API docs at [http://localhost:8000/docs](http://localhost:8000/docs)
- All endpoints for authentication, jobs, applications, etc. are documented there.

## Customization

- Core theme colors can be tweaked in `src/App.css` via CSS variables.
- UI layout: Top navigation, job search section, page-based routing under `src/routes/AppRoutes.js`

## Preview

- To preview the entire stack, ensure the backend is running at the expected URL (`http://localhost:8000` by default).
- Register, post jobs, and apply via the web UI.

## Environment Variables

- `REACT_APP_API_BASE_URL` – the backend URL (default: `http://localhost:8000`)

## Special Notes

- Make sure the backend server is running and CORS is enabled.
- For API schema, refer to the backend OpenAPI spec.

