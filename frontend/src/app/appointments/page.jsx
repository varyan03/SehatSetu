"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:5001";
const POLL_INTERVAL_MS = 15000;

export default function AppointmentsPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSlotBooking, setShowSlotBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const router = useRouter();

  // Available time slots for booking
  const availableSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const fetchAppointments = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/patient?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch appointments");
        return;
      }

  setAppointments(data.patients || data || []);
  setLastUpdated(new Date());
    } catch (err) {
      setError("Error fetching appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchAppointments(userData.id);
    };

    checkAuth();
  }, [fetchAppointments, router]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const interval = setInterval(() => {
      fetchAppointments(user.id);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchAppointments, user?.id]);

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedAppointment) {
      alert("Please select a time slot");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/patient/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        cache: "no-store",
        body: JSON.stringify({
          appointmentStatus: "Scheduled",
          appointmentDate: selectedSlot,
        }),
      });

      if (!response.ok) {
        alert("Failed to book slot");
        return;
      }

      alert("Slot booked successfully!");
      setShowSlotBooking(false);
      setSelectedSlot("");
      fetchAppointments(user.id);
    } catch (err) {
      alert("Error booking slot");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b"; // Amber
      case "Scheduled":
        return "#3b82f6"; // Blue
      case "Completed":
        return "#10b981"; // Green
      case "Cancelled":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: { bg: "#fef3c7", text: "#92400e" },
      Scheduled: { bg: "#dbeafe", text: "#1e40af" },
      Completed: { bg: "#d1fae5", text: "#065f46" },
      Cancelled: { bg: "#fee2e2", text: "#7f1d1d" },
    };

    const color = colors[status] || colors["Pending"];
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          fontWeight: 600,
          backgroundColor: color.bg,
          color: color.text,
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EBF1F1"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "3px solid rgba(0, 223, 129, 0.1)",
            borderTop: "3px solid #00df81",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: "#64748b" }}>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "4rem 1.5rem",
      backgroundColor: "#EBF1F1",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Typography */}
      {/* <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "clamp(8rem, 25vw, 35rem)",
        fontWeight: "900",
        color: "rgba(255, 255, 255, 0.6)",
        whiteSpace: "nowrap",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        letterSpacing: "0.1em"
      }}>
        Schedule
      </div> */}

      <div className="container" style={{ maxWidth: "1000px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#10b981",
              fontSize: "0.95rem",
              marginBottom: "1rem",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: 0
            }}
          >
            ← Back to Dashboard
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "2.75rem", fontWeight: "800", color: "#163321", letterSpacing: "-1px", marginBottom: "0.5rem" }}>
                My Appointments
              </h1>
              <p style={{ color: "#475569", fontSize: "1.1rem" }}>
                View and manage your consultation requests
              </p>
              {lastUpdated && (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.35rem" }}>
                  Last updated: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                onClick={() => user?.id && fetchAppointments(user.id)}
                style={{
                  border: "1px solid #d1fae5",
                  backgroundColor: "#ecfdf3",
                  color: "#047857",
                  padding: "0.65rem 1.1rem",
                  borderRadius: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Refresh
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.5rem", fontWeight: "400", color: "#3d8a62" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                  <path d="M9 12h6"></path>
                  <path d="M12 9v6"></path>
                </svg>
                <strong>Sehat</strong>Setu
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ 
            backgroundColor: "#fef2f2", 
            border: "1px solid #fee2e2", 
            color: "#b91c1c", 
            padding: "1.25rem", 
            borderRadius: "1.25rem", 
            marginBottom: "2rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.71a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          {[
            { label: "Pending", value: appointments.filter((a) => a.appointmentStatus === "Pending").length, color: "#f59e0b", bg: "#fffbeb" },
            { label: "Scheduled", value: appointments.filter((a) => a.appointmentStatus === "Scheduled").length, color: "#3b82f6", bg: "#eff6ff" },
            { label: "Completed", value: appointments.filter((a) => a.appointmentStatus === "Completed").length, color: "#10b981", bg: "#f0fdf4" },
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              backgroundColor: "white", 
              padding: "1.75rem", 
              borderRadius: "1.5rem", 
              border: "1px solid #e2e8f0", 
              boxShadow: "0 10px 15px -10px rgba(0, 0, 0, 0.05)",
              borderLeft: `5px solid ${stat.color}`
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
              <h2 style={{ margin: "0.25rem 0 0 0", fontSize: "2.25rem", color: "#163321", fontWeight: "800" }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div style={{ 
            backgroundColor: "white", 
            padding: "5rem 2rem", 
            borderRadius: "2.5rem", 
            textAlign: "center", 
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ margin: "0 auto 2rem", width: "100px", height: "100px", backgroundColor: "#f8fafc", borderRadius: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v7.5Z"></path><polyline points="2 9.5 12 15 22 9.5"></polyline></svg>
            </div>
            <h3 style={{ fontSize: "1.5rem", color: "#163321", fontWeight: "700", marginBottom: "0.75rem" }}>No Appointments Yet</h3>
            <p style={{ color: "#64748b", marginBottom: "2.5rem", maxWidth: "400px", margin: "0 auto 2.5rem" }}>
              Ready to take control of your cardiovascular health? Start by describing your symptoms.
            </p>
            <button
              onClick={() => router.push("/patient-form")}
              style={{ 
                backgroundColor: "#163321", 
                color: "white", 
                padding: "1rem 2.5rem", 
                borderRadius: "1rem", 
                fontSize: "1.1rem", 
                fontWeight: "600", 
                border: "none", 
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
            >
              Start AI Analysis
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {appointments.map((appointment, index) => (
              <div
                key={appointment._id}
                style={{
                  backgroundColor: "white",
                  padding: "2.5rem",
                  borderRadius: "2rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.05)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "6px",
                  height: "100%",
                  backgroundColor: getStatusColor(appointment.appointmentStatus)
                }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#163321", marginBottom: "0.25rem" }}>
                      {appointment.fullName}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                      Request #{appointments.length - index} • {new Date(appointment.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div>{getStatusBadge(appointment.appointmentStatus)}</div>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
                  gap: "2rem", 
                  paddingBottom: "2rem",
                  borderBottom: "1px solid #f1f5f9",
                  marginBottom: "2rem"
                }}>
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.5rem" }}>Department</p>
                    <p style={{ color: "#163321", fontWeight: "700", fontSize: "1.1rem" }}>{appointment.department}</p>
                  </div>
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.5rem" }}>Patient Contact</p>
                    <p style={{ color: "#163321", fontWeight: "700", fontSize: "1.1rem" }}>{appointment.contact}</p>
                  </div>
                  {appointment.appointmentDate && (
                    <div>
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.5rem" }}>Scheduled For</p>
                      <p style={{ color: "#3b82f6", fontWeight: "800", fontSize: "1.1rem" }}>{appointment.appointmentDate}</p>
                    </div>
                  )}
                  {appointment.assignedDoctor && (
                    <div>
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.5rem" }}>Assigned Specialist</p>
                      <p style={{ color: "#10b981", fontWeight: "800", fontSize: "1.1rem" }}>{appointment.assignedDoctor}</p>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.75rem" }}>Patient Symptoms</p>
                  <p style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "1.15rem", color: "#475569", lineHeight: "1.6", border: "1px solid #f1f5f9" }}>
                    {appointment.symptoms}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  {appointment.appointmentStatus === "Pending" && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowSlotBooking(true);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "#163321",
                        color: "white",
                        padding: "1rem",
                        borderRadius: "1rem",
                        fontWeight: "600",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
                    >
                      Wait for Specialist Confirmation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slot Booking Modal (Minimalist) */}
        {showSlotBooking && selectedAppointment && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(22, 51, 33, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem"
          }}>
            <div style={{ 
              backgroundColor: "white", 
              maxWidth: "500px", 
              width: "100%", 
              padding: "3rem", 
              borderRadius: "2.5rem", 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)" 
            }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#163321", marginBottom: "0.5rem" }}>Select Time Slot</h2>
              <p style={{ color: "#64748b", marginBottom: "2rem" }}>Choose a preferred time for your consultation.</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "1rem",
                      border: selectedSlot === slot ? "2px solid #00df81" : "1px solid #e2e8f0",
                      background: selectedSlot === slot ? "#f0fdf4" : "white",
                      color: selectedSlot === slot ? "#10b981" : "#163321",
                      fontWeight: selectedSlot === slot ? "700" : "600",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      transition: "all 0.2s"
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => { setShowSlotBooking(false); setSelectedSlot(""); }}
                  style={{ flex: 1, padding: "1rem", borderRadius: "1rem", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSlot}
                  style={{ flex: 1, padding: "1rem", borderRadius: "1rem", border: "none", backgroundColor: "#163321", color: "white", fontWeight: "700", cursor: "pointer" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
