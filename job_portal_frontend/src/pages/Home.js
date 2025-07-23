import React from "react";

/**
 * PUBLIC_INTERFACE
 * Home/Landing page for the job portal.
 */
const Home = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
    background: "var(--color-bg)",
    padding: "0 12px"
  }}>
    <h1 style={{
      fontWeight: 800,
      color: "var(--color-primary)",
      fontSize: "2.7rem",
      textAlign: "center",
      margin: "0 0 12px 0",
      letterSpacing: "-.01em"
    }}>
      Welcome to the <span style={{ color: "var(--color-accent)" }}>IT Job Portal</span>
    </h1>
    <p style={{
      color: "var(--color-text-secondary)",
      textAlign: "center",
      fontSize: "1.27rem",
      fontWeight: 400,
      marginBottom: 34
    }}>
      Find your next IT job — or post your open position.<br />
      <span style={{
        display: "inline-block",
        background: "var(--color-secondary)",
        color: "var(--color-primary)",
        padding: "2px 10px",
        borderRadius: 7,
        marginTop: 10,
        fontSize: "99%"
      }}>
        Search jobs &middot; Apply &middot; Hire talent
      </span>
    </p>
    <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
      <a className="App-link" href="/jobs" style={{
        background: "var(--color-accent)",
        color: "#212121",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: "1.09em",
        padding: "9px 27px",
        boxShadow: "0px 2px 7px 0px rgba(255,179,0,.04)"
      }}>Browse Jobs</a>
      <a className="App-link" href="/register" style={{
        background: "var(--color-primary)",
        color: "#fff",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: "1.09em",
        padding: "9px 27px"
      }}>Sign Up</a>
    </div>
  </div>
);

export default Home;
