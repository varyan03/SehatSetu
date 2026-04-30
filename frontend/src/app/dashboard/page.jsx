"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [router, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    )},
    { name: "Waiting Room", href: "/waiting-room", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"></path><path d="M9 21v-6h6v6"></path><path d="M10 11h4"></path></svg>
    )},
    { name: "Intake", href: "/patient-form", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
    )},
    { name: "Schedule", href: "/appointments", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    )},
  ];

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#EBF1F1",
      background: "radial-gradient(circle at 0% 0%, rgba(0, 223, 129, 0.12) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(22, 51, 33, 0.08) 0%, transparent 70%), radial-gradient(circle at 100% 0%, rgba(0, 223, 129, 0.07) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 80%), #EBF1F1",
      position: "relative", 
      overflowX: "hidden" 
    }}>
      
      {/* Sidebar Navigation (Expandable) */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        style={{
          width: isSidebarExpanded ? "280px" : "86px",
          backgroundColor: "white",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 50,
          padding: isSidebarExpanded ? "2rem 1.5rem" : "2rem 1rem",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isSidebarExpanded ? "10px 0 30px rgba(0,0,0,0.05)" : "none"
        }}>
        {/* Brand Logo */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "1rem", 
          fontSize: "1.5rem", 
          color: "#3d8a62", 
          marginBottom: "3rem", 
          paddingLeft: "0.5rem",
          overflow: "hidden"
        }}>
          <div style={{ minWidth: "32px", display: "flex", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              <path d="M9 12h6"></path>
              <path d="M12 9v6"></path>
            </svg>
          </div>
          <div style={{ 
            opacity: isSidebarExpanded ? 1 : 0, 
            visibility: isSidebarExpanded ? "visible" : "hidden",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
            fontWeight: "700"
          }}>
            <strong style={{ color: "#3d8a62" }}>Sehat</strong><span style={{ color: "#163321" }}>Setu</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                padding: "1rem",
                borderRadius: "1rem",
                color: link.href === "/dashboard" ? "#163321" : "#64748b",
                backgroundColor: link.href === "/dashboard" ? "#f0fdf4" : "transparent",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseOver={(e) => {
                if (link.href !== "/dashboard") e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseOut={(e) => {
                if (link.href !== "/dashboard") e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ minWidth: "24px", display: "flex", justifyContent: "center", color: link.href === "/dashboard" ? "#00df81" : "inherit" }}>{link.icon}</div>
              <span style={{ 
                opacity: isSidebarExpanded ? 1 : 0, 
                visibility: isSidebarExpanded ? "visible" : "hidden",
                transition: "all 0.3s ease"
              }}>
                {link.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Profile Snippet (Refined) */}
        <div style={{ marginTop: "auto", paddingTop: "2rem", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ 
            marginBottom: "1.5rem", 
            paddingLeft: "0.5rem", 
            opacity: isSidebarExpanded ? 1 : 0, 
            visibility: isSidebarExpanded ? "visible" : "hidden",
            transition: "all 0.3s ease",
            height: isSidebarExpanded ? "auto" : "0px",
            overflow: "hidden"
          }}>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Patient Account</p>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#163321", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email.split("@")[0]}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ 
              width: "100%",
              backgroundColor: "#163321", 
              color: "white", 
              padding: "0.85rem", 
              borderRadius: "1.25rem", 
              border: "none", 
              fontWeight: "600", 
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isSidebarExpanded ? "0.75rem" : "0",
              overflow: "hidden"
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#00df81"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#163321"; }}
          >
            <div style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <span style={{ 
              opacity: isSidebarExpanded ? 1 : 0,
              maxWidth: isSidebarExpanded ? "100px" : "0px",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
              fontSize: "0.9rem"
            }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Side */}
      <div style={{ flex: 1, position: "relative", overflowY: "auto", maxHeight: "100vh" }}>
        
        {/* Background Typography (Watermark) */}
        <div style={{
          position: "absolute",
          top: "80%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(5rem, 20vw, 25rem)",
          fontWeight: "900",
          color: "rgba(255, 255, 255, 0.6)",
          whiteSpace: "nowrap",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "0.1em"
        }}>
          Dash Board
        </div>

        {/* Global Nav for Mobile (Optional, hidden on desktop if needed, but let's keep content focused) */}
        <main style={{ 
          padding: "4rem 4rem", 
          paddingLeft: "5rem", 
          position: "relative", 
          zIndex: 1,
          transition: "padding-left 0.4s ease"
        }}>
          <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Welcome Header */}
            <header style={{ marginBottom: "3.5rem", textAlign: "center" }}>
              <h1 style={{ fontSize: "2.75rem", color: "#ffffff", fontWeight: "800", letterSpacing: "-1px", marginBottom: "0.5rem", textShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                Welcome back, <span style={{ color: "#00df81" }}>{user.email.split("@")[0]}!</span>
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#475569" }}>
                Here&apos;s what&apos;s happening with your health today.
              </p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
              {[
                { label: "AI Intake Forms", value: "1", subtext: "Completed", color: "#10b981", bg: "#f0fdf4" },
                { label: "Active Doctors", value: "54", subtext: "Matching specialization", color: "#3b82f6", bg: "#eff6ff" },
                { label: "Upcoming Appts", value: "0", subtext: "Next 7 days", color: "#f59e0b", bg: "#fffbeb" },
              ].map((stat, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: "white", 
                  padding: "2rem", 
                  borderRadius: "1.5rem", 
                  border: "1px solid #e2e8f0", 
                  boxShadow: "0 10px 15px -10px rgba(0, 0, 0, 0.05)" 
                }}>
                  <div style={{ width: "3rem", height: "3rem", backgroundColor: stat.bg, borderRadius: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                    {idx === 0 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    ) : idx === 1 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path><path d="M19 21V11"></path><path d="M5 21V11"></path><path d="M9 21V11"></path><path d="M15 21V11"></path></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                  <h2 style={{ margin: "0.5rem 0", fontSize: "2.25rem", color: "#163321", fontWeight: "800" }}>{stat.value}</h2>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>{stat.subtext}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
              {/* Action Area */}
              <div>
                <h3 style={{ fontSize: "1.5rem", color: "#163321", fontWeight: "700", marginBottom: "1.5rem" }}>Core Actions</h3>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  <div style={{ 
                    backgroundColor: "white", 
                    padding: "2rem", 
                    borderRadius: "1.5rem", 
                    border: "1px solid #e2e8f0", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#f0fdf4", borderRadius: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", color: "#10b981" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.15rem", color: "#163321", fontWeight: "700" }}>Medical Intake Form</h4>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "#64748b" }}>Analyze symptoms with our AI assistant</p>
                      </div>
                    </div>
                    <Link href="/patient-form" style={{ 
                      backgroundColor: "#163321", 
                      color: "white", 
                      padding: "0.75rem 1.5rem", 
                      borderRadius: "0.75rem", 
                      textDecoration: "none", 
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
                    >
                      Start Analysis
                    </Link>
                  </div>

                  <div style={{ 
                    backgroundColor: "white", 
                    padding: "2rem", 
                    borderRadius: "1.5rem", 
                    border: "1px solid #e2e8f0", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#f0fdf4", borderRadius: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", color: "#10b981" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"></path><path d="M9 21v-6h6v6"></path><path d="M10 11h4"></path></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.15rem", color: "#163321", fontWeight: "700" }}>Waiting Room</h4>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "#64748b" }}>Track queue position and updates</p>
                      </div>
                    </div>
                    <Link href="/waiting-room" style={{ 
                      backgroundColor: "#163321", 
                      color: "white", 
                      padding: "0.75rem 1.5rem", 
                      borderRadius: "0.75rem", 
                      textDecoration: "none", 
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
                    >
                      View Queue
                    </Link>
                  </div>

                  <div style={{ 
                    backgroundColor: "white", 
                    padding: "2rem", 
                    borderRadius: "1.5rem", 
                    border: "1px solid #e2e8f0", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#eff6ff", borderRadius: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", color: "#3b82f6" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.15rem", color: "#163321", fontWeight: "700" }}>My Appointments</h4>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "#64748b" }}>Manage your bookings and consults</p>
                      </div>
                    </div>
                    <Link href="/appointments" style={{ 
                      backgroundColor: "#163321", 
                      color: "white", 
                      padding: "0.75rem 1.5rem", 
                      borderRadius: "0.75rem", 
                      textDecoration: "none", 
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
                    >
                      View Schedule
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar info */}
              <div>
                <h3 style={{ fontSize: "1.5rem", color: "#163321", fontWeight: "700", marginBottom: "1.5rem" }}>Security</h3>
                <div style={{ 
                  backgroundColor: "#163321", 
                  padding: "2rem", 
                  borderRadius: "2rem", 
                  color: "white",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h4 style={{ color: "white", fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" }}>Your Privacy Matters</h4>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", margin: 0 }}>
                      Your health data is protected with military-grade encryption and only accessible to authorized medical staff.
                    </p>
                  </div>
                  {/* Subtle graphic element */}
                  <div style={{ position: "absolute", bottom: "-10%", right: "-10%", opacity: 0.1 }}>
                    <svg width="150" height="150" viewBox="0 0 24 24" fill="white">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer from Home Page */}
        <footer style={{ 
          position: "relative", 
          backgroundColor: "#EBF1F1", 
          overflow: "hidden", 
          paddingTop: "6rem", 
          paddingBottom: "2rem",
          borderTop: "1px solid rgba(22, 51, 33, 0.05)"
        }}>
          <div style={{
            position: "absolute",
            bottom: "-5%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(6rem, 16vw, 12rem)",
            fontWeight: "800",
            color: "#ffffff",
            whiteSpace: "nowrap",
            zIndex: 0,
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "0.15em",
            wordSpacing: "-0.2em",
            lineHeight: 0.8,
            opacity: 0.6
          }}>
            SEHAT SETU
          </div>

          <div className="container" style={{ position: "relative", zIndex: 10, maxWidth: "1000px", margin: "0 auto" }}>
            <div className="grid md:grid-cols-3 gap-12 lg:gap-24 mb-16" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.75rem", fontWeight: "400", color: "#3d8a62", marginBottom: "1.5rem" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    <path d="M9 12h6"></path>
                    <path d="M12 9v6"></path>
                  </svg>
                  <strong>Sehat</strong>Setu
                </div>
                <p style={{ color: "#475569", lineHeight: "1.6" }}>Your journey to better healthcare accessibility starts right here.</p>
              </div>
              <div>
                <h4 style={{ color: "#163321", marginBottom: "1.5rem", fontWeight: "600", fontSize: "1.2rem" }}>Quick Links</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", padding: 0, margin: 0 }}>
                  <li><Link href="/register" style={{ color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Sign Up</Link></li>
                  <li><Link href="/login" style={{ color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Patient Login</Link></li>
                  <li><Link href="#" style={{ color: "#475569", textDecoration: "none", transition: "color 0.2s" }}>Doctor Portal</Link></li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: "#163321", marginBottom: "1.5rem", fontWeight: "600", fontSize: "1.2rem" }}>Contact</h4>
                <p style={{ color: "#475569", marginBottom: "0.5rem" }}>support@sehatsetu.com</p>
                <p style={{ color: "#475569" }}>+1-800-HEALTHY</p>
              </div>
            </div>
            
            <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(22, 51, 33, 0.1)", textAlign: "center", color: "#64748B", fontSize: "0.9rem" }}>
              &copy; {new Date().getFullYear()} Sehat Setu. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
