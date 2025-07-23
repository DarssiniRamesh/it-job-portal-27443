import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/AuthContext";

// Backend endpoints:
// - GET /users/me (current user basic info, already used in context)
// - PATCH /users/{user_id} (name/pw update)
// - GET /profiles/{user_id} (job seeker profile: headline, skills, etc.)
// - PUT /profiles/me (update job seeker profile)
// Employers manage company info directly on user (no separate profile object)
//
// PUBLIC_INTERFACE
/**
 * User profile page: job seekers can update personal info, resume, and profile (headline/skills/exp).
 * Employers can update company info and contact details.
 * Role-aware, form validation, and backend integrated.
 */
const Profile = () => {
  const { user, token, loading: authLoading, login } = useAuth();
  const [mode, setMode] = useState(null); // 'job_seeker' or 'employer'
  const [form, setForm] = useState(null); // main form state (user)
  const [profile, setProfile] = useState(null); // for job seekers
  const [profileLoading, setProfileLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For resume upload: store the selected file in state (no backend endpoint in spec, so dummy)
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState("");
  const resumeInputRef = useRef();

  // Fetch initial user and profile data
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setMode(user.role);
    setForm({
      id: user.id,
      email: user.email,
      full_name: user.full_name || "",
      // company_name only for employer
      ...(user.role === "employer" ? { company: user.company || "" } : {}),
    });
    if (user.role === "job_seeker") {
      setProfileLoading(true);
      fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/profiles/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(async (res) => {
          if (!res.ok) return null;
          return await res.json();
        })
        .then((p) => setProfile(p || {}))
        .catch(() => setProfile({}))
        .finally(() => setProfileLoading(false));
    }
  }, [user, token, authLoading]);

  // Handlers for main form
  const handleFormChange = (evt) => {
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handlers for job seeker profile section
  const handleProfileChange = (evt) => {
    const { name, value } = evt.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  function handleSkillsChange(evt) {
    const v = evt.target.value;
    setProfile((p) => ({
      ...p,
      skills: v.split(",").map((x) => x.trim()).filter(Boolean),
    }));
  }

  // Validate input (simple but effective)
  function validateInput() {
    if (!form.full_name || form.full_name.length < 2) {
      return "Name is required.";
    }
    if (mode === "employer" && (!form.company || form.company.length < 2)) {
      return "Company name is required.";
    }
    // Job seeker extra: headline, skills can be empty, exp/edu optional
    return "";
  }

  // Handle main profile update (base user info)
  async function submitUserInfo(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    const errMsg = validateInput();
    if (errMsg) {
      setSubmitError(errMsg);
      return;
    }
    setIsSubmitting(true);
    try {
      // PATCH /users/{user_id} : full_name, password, (company not a standard field in spec)
      const payload = { full_name: form.full_name };
      if (mode === "employer" && form.company) {
        payload.company = form.company;
      }
      if (form.password && form.password.length > 5) {
        payload.password = form.password;
      }
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || "Failed to update profile");
      }
      setSubmitSuccess("Profile updated!");
      // Refresh user info in auth context
      login(token); // triggers getMe
    } catch (err) {
      setSubmitError(err.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle resume upload (no API spec, so just simulate client-side handling)
  function handleResumeChange(e) {
    const file = e.target.files?.[0] ?? null;
    setResumeFile(file);
    setResumeUploadStatus("");
  }
  function handleResumeUpload(e) {
    e.preventDefault();
    if (!resumeFile) {
      setResumeUploadStatus("Please select a file to upload.");
      return;
    }
    // Would call a real API in production...
    setTimeout(() => {
      setResumeUploadStatus("Resume uploaded (simulated).");
      setResumeFile(null);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    }, 900);
  }

  // Handle profile update for job seeker (PUT /profiles/me)
  async function handleProfileSave(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);
    try {
      const payload = {
        headline: profile.headline,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
      };
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/profiles/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || "Failed to update profile info");
      }
      setSubmitSuccess("Profile section updated!");
    } catch (err) {
      setSubmitError(err.message || "Failed to update profile info.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) return <div>Loading user info...</div>;
  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: "36px auto", textAlign: "left" }}>
        <h2>Login Required</h2>
        <p>You must be logged in to view and edit your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 650, margin: "34px auto", padding: "12px", textAlign: "left" }}>
      <h2 style={{ marginBottom: 10 }}>
        {mode === "job_seeker" ? "Candidate" : "Employer"} Profile
      </h2>
      <form onSubmit={submitUserInfo} style={profileFormStyle} autoComplete="off">
        <label>
          Email<br />
          <input name="email" value={form.email} type="email" disabled style={inputStyle} />
        </label>
        <label style={{ marginTop: 13 }}>
          Full Name<br />
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleFormChange}
            required
            style={inputStyle}
            disabled={isSubmitting}
          />
        </label>
        {mode === "employer" && (
          <label style={{ marginTop: 13 }}>
            Company Name<br />
            <input
              name="company"
              value={form.company || ""}
              onChange={handleFormChange}
              required
              style={inputStyle}
              disabled={isSubmitting}
            />
          </label>
        )}
        <label style={{ marginTop: 13 }}>
          Change Password<br />
          <input
            name="password"
            type="password"
            placeholder="New password (leave blank to keep unchanged)"
            value={form.password || ""}
            onChange={handleFormChange}
            minLength={6}
            style={inputStyle}
            disabled={isSubmitting}
          />
        </label>
        {submitError && (
          <div style={{ color: "#E87A41", marginTop: 10 }}>{submitError}</div>
        )}
        {submitSuccess && (
          <div style={{ color: "#177d26", marginTop: 10 }}>{submitSuccess}</div>
        )}
        <button
          type="submit"
          className="theme-toggle"
          style={{ marginTop: 18, minWidth: 138 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
      <hr style={{ margin: "30px 0 20px 0" }} />
      {mode === "job_seeker" && (
        <>
          <h3>Candidate Profile</h3>
          <form onSubmit={handleProfileSave} style={profileFormStyle}>
            <label>
              Headline (short summary)<br />
              <input
                name="headline"
                value={profile?.headline || ""}
                onChange={handleProfileChange}
                maxLength={70}
                style={inputStyle}
                disabled={profileLoading || isSubmitting}
              />
            </label>
            <label style={{ marginTop: 13 }}>
              Skills / Keywords (comma-separated)<br />
              <input
                name="skills"
                value={Array.isArray(profile?.skills) ? profile.skills.join(", ") : ""}
                onChange={handleSkillsChange}
                placeholder="e.g. React, Python, AWS"
                style={inputStyle}
                disabled={profileLoading || isSubmitting}
              />
            </label>
            <label style={{ marginTop: 13 }}>
              Experience Summary<br />
              <textarea
                name="experience"
                value={profile?.experience || ""}
                onChange={handleProfileChange}
                maxLength={800}
                rows={3}
                style={{ ...inputStyle, minHeight: 66, fontFamily: "inherit" }}
                disabled={profileLoading || isSubmitting}
              />
            </label>
            <label style={{ marginTop: 13 }}>
              Education<br />
              <textarea
                name="education"
                value={profile?.education || ""}
                onChange={handleProfileChange}
                maxLength={300}
                rows={2}
                style={{ ...inputStyle, minHeight: 42, fontFamily: "inherit" }}
                disabled={profileLoading || isSubmitting}
              />
            </label>
            <button
              type="submit"
              className="theme-toggle"
              style={{ marginTop: 17, minWidth: 170 }}
              disabled={profileLoading || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Candidate Profile"}
            </button>
          </form>
          <div style={{ margin: "28px 0 0 0", background: "#fcf8ed", padding: "16px 13px", borderRadius: 10, border: "1px solid #ecdcce"}}>
            <b>Upload Resume (PDF/DOC)</b>
            <form onSubmit={handleResumeUpload} style={{ marginTop: 8 }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                ref={resumeInputRef}
                onChange={handleResumeChange}
                disabled={profileLoading || isSubmitting}
              />
              <button
                disabled={profileLoading || isSubmitting || !resumeFile}
                type="submit"
                style={{ marginLeft: 12, background: "#e8eaf6", borderRadius: 7 }}
              >
                Upload
              </button>
              {resumeFile && <span style={{ marginLeft: 8 }}>{resumeFile.name}</span>}
              {resumeUploadStatus && (
                <div style={{ color: "#0056b3", marginTop: 5 }}>{resumeUploadStatus}</div>
              )}
            </form>
            <p style={{ marginTop: 5, color: "#657", fontSize: "92%" }}>
              (Resume upload is simulated in this demo. Resume data is not stored.)
            </p>
          </div>
        </>
      )}
      {mode === "employer" && (
        <>
          <h3 style={{ marginTop: 32 }}>Company/Employer Info</h3>
          <div style={{ margin: "9px 0 18px 0", fontSize: "96%" }}>
            <b>Name: </b> {form.company}
            <br />
            <b>Email: </b> {form.email}
          </div>
          <div style={{ background: "#e8eaf6", padding: "13px 17px", borderRadius: 10 }}>
            <p style={{ margin: 0 }}>
              <b>Note for employers:</b> You may update your name, company, and contact email here.<br />
              Additional company info may be managed in future releases.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const profileFormStyle = {
  background: "#f7f8fd",
  borderRadius: 11,
  padding: "19px 19px",
  maxWidth: 470,
  margin: "21px auto 12px auto",
  border: "1px solid #dfdfef",
  display: "flex",
  flexDirection: "column",
  gap: "3px"
};
const inputStyle = {
  width: "100%",
  minHeight: 28,
  fontSize: "101%",
  marginTop: 2,
  marginBottom: 0,
  borderRadius: 5,
  border: "1px solid #dadce4",
  padding: "5px"
};

export default Profile;
