"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
      backgroundColor: "#EBF1F1",
      backgroundImage: "url('/login-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Typography (Optional / Commented out per user pattern) */}
      {/* <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "clamp(7rem, 20vw, 30rem)",
        fontWeight: "900",
        color: "rgba(255, 255, 255, 0.4)",
        whiteSpace: "nowrap",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        letterSpacing: "0.2em"
      }}>
        Login
      </div> */}

      <div className="card" style={{ 
        maxWidth: "480px", 
        width: "100%", 
        position: "relative", 
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        borderRadius: "2.5rem",
        padding: "3.5rem 3rem",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15)"
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "1.75rem", fontWeight: "400", color: "#3d8a62", marginBottom: "1rem" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              <path d="M9 12h6"></path>
              <path d="M12 9v6"></path>
            </svg>
            <strong>Sehat</strong>Setu
          </div>
          <h1 style={{ fontSize: "2rem", color: "#163321", marginBottom: "0.75rem", fontWeight: "700", letterSpacing: "-0.5px" }}>Welcome Back</h1>
          <p style={{ color: "#475569", fontSize: "1rem" }}>Sign in to your health profile</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ 
            backgroundColor: "#fef2f2", 
            border: "1px solid #fee2e2", 
            color: "#b91c1c", 
            padding: "1rem", 
            borderRadius: "1rem", 
            marginBottom: "1.5rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem",
            fontSize: "0.9rem"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.71a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label htmlFor="email" style={{ color: "#163321", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem", display: "block" }}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ 
                width: "100%",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                fontSize: "1rem",
                transition: "all 0.2s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#00df81"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ color: "#163321", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.5rem", display: "block" }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ 
                width: "100%",
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                fontSize: "1rem",
                transition: "all 0.2s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#00df81"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: "100%", 
              backgroundColor: "#163321", 
              color: "white", 
              padding: "1rem", 
              borderRadius: "1rem", 
              fontSize: "1rem", 
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              border: "none",
              marginTop: "0.5rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div style={{ margin: "2rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: "500" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
        </div>

        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "1.5rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#10b981", fontWeight: "700", textDecoration: "none" }}>
            Create one
          </Link>
        </p>

        <Link
          href="/"
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "0.9rem",
            display: "block",
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          ← Back to SehatSetu home
        </Link>
      </div>
    </div>
  );
}
