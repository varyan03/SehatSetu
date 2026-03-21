"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  }, [router]);

  const fetchAppointments = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch appointments");
        return;
      }

      setAppointments(data.patients || data || []);
    } catch (err) {
      setError("Error fetching appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedAppointment) {
      alert("Please select a time slot");
      return;
    }

    try {
      const response = await fetch(`/api/patient/${selectedAppointment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          appointmentStatus: "Scheduled",
          appointmentDate: selectedSlot,
        }),
      });

      if (!response.ok) {
        alert("Failed to book slot");
        return;
      }

      alert("✅ Slot booked successfully!");
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #6366f1",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1.5rem",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              fontSize: "1rem",
              marginBottom: "1rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            📋 My Appointments
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
            View and manage your appointment requests
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            className="card"
            style={{
              padding: "1.5rem",
              borderLeft: "4px solid #f59e0b",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              Pending
            </p>
            <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>
              {appointments.filter((a) => a.appointmentStatus === "Pending").length}
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: "1.5rem",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              Scheduled
            </p>
            <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>
              {appointments.filter((a) => a.appointmentStatus === "Scheduled").length}
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: "1.5rem",
              borderLeft: "4px solid #10b981",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              Completed
            </p>
            <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>
              {appointments.filter((a) => a.appointmentStatus === "Completed").length}
            </p>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "3rem",
              textAlign: "center",
              background: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</p>
            <h3 style={{ color: "#1e40af", marginBottom: "0.5rem" }}>
              No Appointments Yet
            </h3>
            <p style={{ color: "#3b82f6", marginBottom: "2rem" }}>
              Fill out the patient form to request an appointment
            </p>
            <button
              onClick={() => router.push("/patient-form")}
              className="btn btn-primary"
            >
              Create New Appointment
            </button>
          </div>
        ) : (
          <div>
            {appointments.map((appointment, index) => (
              <div
                key={appointment._id}
                className="card"
                style={{
                  padding: "2rem",
                  marginBottom: "1.5rem",
                  borderTop: `4px solid ${getStatusColor(appointment.appointmentStatus)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                      {appointment.fullName}
                    </h3>
                    <p style={{ color: "#6b7280" }}>
                      Request #{index + 1} • {new Date(appointment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(appointment.appointmentStatus)}</div>
                </div>

                {/* Appointment Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "1.5rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Department</p>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                      {appointment.department}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Contact</p>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                      {appointment.contact}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Date of Birth</p>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                      {new Date(appointment.dob).toLocaleDateString()}
                    </p>
                  </div>

                  {appointment.appointmentDate && (
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                        Appointment Date
                      </p>
                      <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "#3b82f6" }}>
                        {appointment.appointmentDate}
                      </p>
                    </div>
                  )}

                  {appointment.assignedDoctor && (
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Assigned Doctor</p>
                      <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "#10b981" }}>
                        {appointment.assignedDoctor}
                      </p>
                    </div>
                  )}
                </div>

                {/* Symptoms */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    Symptoms
                  </p>
                  <p
                    style={{
                      background: "#f3f4f6",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {appointment.symptoms}
                  </p>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                      Doctor's Notes
                    </p>
                    <p
                      style={{
                        background: "#dbeafe",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        borderLeft: "4px solid #3b82f6",
                        lineHeight: "1.6",
                      }}
                    >
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {appointment.appointmentStatus === "Pending" && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowSlotBooking(true);
                      }}
                      className="btn btn-primary"
                      style={{
                        flex: "1",
                        minWidth: "150px",
                      }}
                    >
                      ⏳ Awaiting Approval
                    </button>
                  )}

                  {appointment.appointmentStatus === "Scheduled" && (
                    <button
                      className="btn"
                      style={{
                        flex: "1",
                        minWidth: "150px",
                        background: "#10b981",
                        color: "white",
                        cursor: "not-allowed",
                        opacity: 0.9,
                        pointerEvents: "none",
                      }}
                      disabled
                    >
                      ✅ Appointment Scheduled
                    </button>
                  )}

                  {appointment.appointmentStatus === "Completed" && (
                    <button
                      className="btn"
                      style={{
                        flex: "1",
                        minWidth: "150px",
                        background: "#10b981",
                        color: "white",
                        cursor: "not-allowed",
                        opacity: 0.9,
                        pointerEvents: "none",
                      }}
                      disabled
                    >
                      ✅ Completed
                    </button>
                  )}

                  <button
                    onClick={() => router.push("/patient-form")}
                    className="btn btn-primary"
                    style={{ flex: "1", minWidth: "150px" }}
                  >
                    + New Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slot Booking Modal */}
        {showSlotBooking && selectedAppointment && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1.5rem",
            }}
          >
            <div
              className="card"
              style={{ maxWidth: "500px", width: "100%", padding: "2rem" }}
            >
              <h2 style={{ marginBottom: "1.5rem" }}>📅 Book Appointment Slot</h2>

              <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
                For: <strong>{selectedAppointment.fullName}</strong> •{" "}
                <strong>{selectedAppointment.department}</strong>
              </p>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                }}
              >
                Select your preferred time slot:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      border: "2px solid #e5e7eb",
                      background:
                        selectedSlot === slot ? "#6366f1" : "white",
                      color: selectedSlot === slot ? "white" : "#1f2937",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSlot !== slot) {
                        e.target.style.background = "#f3f4f6";
                        e.target.style.borderColor = "#6366f1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSlot !== slot) {
                        e.target.style.background = "white";
                        e.target.style.borderColor = "#e5e7eb";
                      }
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <p
                  style={{
                    background: "#d1fae5",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    color: "#065f46",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  ✅ Selected: {selectedSlot}
                </p>
              )}

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => {
                    setShowSlotBooking(false);
                    setSelectedSlot("");
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSlot}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
