"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav style={{ background: "white", boxShadow: "var(--shadow-md)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem" }}>
          <div className="nav-brand">🏥 Sehat Setu</div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.95rem", color: "#6b7280" }}>{user.email}</span>
            <button
              onClick={handleLogout}
              className="btn btn-primary"
              style={{ padding: "0.65rem 1.25rem", fontSize: "0.95rem" }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "3rem 1.5rem" }}>
        <div className="container">
          {/* Welcome Section */}
          <div className="card" style={{ marginBottom: "2.5rem", background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)", color: "white" }}>
            <div>
              <h2 style={{ color: "white", marginBottom: "0.5rem" }}>Welcome back, {user.email.split("@")[0]}! 👋</h2>
              <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "0" }}>You're logged in as a {user.role}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-3" style={{ marginBottom: "2.5rem" }}>
            {[
              { icon: "📋", label: "Total Forms", value: "1", color: "#6366f1" },
              { icon: "🏥", label: "Departments", value: "8", color: "#06b6d4" },
              { icon: "👨‍⚕️", label: "Doctors", value: "50+", color: "#10b981" },
            ].map((stat, idx) => (
              <div key={idx} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{stat.icon}</div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>{stat.label}</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <h3 style={{ marginBottom: "1.5rem", marginTop: "2rem" }}>Quick Actions</h3>
          <div className="grid grid-2">
            {/* Patient Form Card */}
            <div className="card" style={{ transition: "var(--transition)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}>
                  📋
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Patient Information</h4>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0" }}>Fill out your medical details</p>
                </div>
              </div>
              <Link href="/patient-form" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Fill Form →
              </Link>
            </div>

            {/* Medical Records Card */}
            <div className="card" style={{ opacity: 0.6, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}>
                  🏥
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Medical Records</h4>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0" }}>View your health history</p>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", opacity: 0.7, cursor: "not-allowed" }}>
                Coming Soon
              </button>
            </div>

            {/* Appointments Card */}
            <div className="card" style={{ transition: "var(--transition)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}>
                  📅
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Appointments</h4>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0" }}>Book or view appointments</p>
                </div>
              </div>
              <Link href="/appointments" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                View Appointments →
              </Link>
            </div>

            {/* Doctor Chat Card */}
            <div className="card" style={{ opacity: 0.6, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}>
                  💬
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Contact Doctor</h4>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0" }}>Message your doctor</p>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1rem", opacity: 0.7, cursor: "not-allowed" }}>
                Coming Soon
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="card" style={{ marginTop: "2.5rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Profile Information</h3>
            <div className="grid grid-2">
              <div>
                <label style={{ fontSize: "0.85rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Email</label>
                <p style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}>{user.email}</p>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Role</label>
                <p style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}>{user.role}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.85rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>User ID</label>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", fontFamily: "monospace", wordBreak: "break-all" }}>{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#1f2937", color: "#d1d5db", padding: "2rem 1.5rem", marginTop: "auto" }}>
        <div className="container" style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <p>&copy; 2026 Sehat Setu. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
