"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:5001";
const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General",
];

export default function DoctorDashboardPage() {
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [department, setDepartment] = useState("Cardiology");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState("offline");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [router, user]);

  const getToken = () => localStorage.getItem("token");

  const fetchCurrentPatient = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/doctor/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch current patient");
      }

      setCurrentPatient(data.currentPatient || null);
      setStatus(data.status || "offline");
      setError("");
    } catch (err) {
      console.error("Current patient error:", err);
      setError(err.message || "Failed to fetch current patient");
    }
  }, []);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch doctor profile");
      }

      setDoctorProfile(data.doctor || null);
      if (data.doctor?.department) {
        setDepartment(data.doctor.department);
      }
      setError("");
    } catch (err) {
      console.error("Doctor profile error:", err);
      setError(err.message || "Failed to fetch doctor profile");
    }
  }, []);

  const fetchQueue = useCallback(async (overrideDepartment) => {
    try {
      const token = getToken();
      const targetDepartment = overrideDepartment || department;
      const response = await fetch(
        `${API_BASE_URL}/api/queue/department/${encodeURIComponent(
          targetDepartment
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch queue");
      }

      setQueue(data.queue || []);
      setError("");
    } catch (err) {
      console.error("Queue fetch error:", err);
      setError(err.message || "Failed to fetch queue");
    }
  }, [department]);

  const handleDepartmentChange = async (nextDepartment) => {
    if (!nextDepartment) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/doctor/department`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
        body: JSON.stringify({ department: nextDepartment }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update department");
      }

      setDepartment(nextDepartment);
      setDoctorProfile(data.doctor || null);
      await fetchQueue(nextDepartment);
      setError("");
    } catch (err) {
      console.error("Department update error:", err);
      setError(err.message || "Failed to update department");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "DOCTOR") {
      setError("This dashboard is available for doctors only.");
      return;
    }

    fetchDoctorProfile();
  }, [user, fetchDoctorProfile]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "DOCTOR") {
      setError("This dashboard is available for doctors only.");
      return;
    }

    fetchCurrentPatient();
    fetchQueue();
  }, [user, department, fetchCurrentPatient, fetchQueue]);

  const handleNextPatient = async () => {
    setActionLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/doctor/next`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to move to next patient");
      }

      await fetchCurrentPatient();
      await fetchQueue();
      setError("");
    } catch (err) {
      console.error("Next patient error:", err);
      setError(err.message || "Failed to move to next patient");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const payload = { status: nextStatus };
      if (nextStatus === "on_break") {
        payload.breakDuration = Number(breakMinutes) || 0;
      }

      const response = await fetch(`${API_BASE_URL}/api/doctor/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setStatus(nextStatus);
      setError("");
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#EBF1F1",
      padding: "3rem 2rem",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#163321" }}>
            Doctor Control Panel
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Manage your queue, status, and current patient.
          </p>
          {doctorProfile?.department && (
            <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
              Department: <strong>{doctorProfile.department}</strong>
            </p>
          )}
        </header>

        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#b91c1c",
            padding: "1rem 1.25rem",
            borderRadius: "1rem",
            marginBottom: "2rem",
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: "grid",
          gap: "2rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}>
          <section style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 20px 45px -30px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
              Current Patient
            </h2>
            {currentPatient ? (
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {currentPatient.fullName}
                </p>
                <p style={{ margin: "0.35rem 0", color: "#64748b" }}>
                  Symptoms: {currentPatient.symptoms}
                </p>
                <button
                  onClick={handleNextPatient}
                  disabled={actionLoading}
                  style={{
                    marginTop: "1.25rem",
                    backgroundColor: "#163321",
                    color: "white",
                    border: "none",
                    padding: "0.85rem 1.75rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Processing..." : "Next Patient"}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: "#64748b" }}>No patient currently in session.</p>
                <button
                  onClick={handleNextPatient}
                  disabled={actionLoading}
                  style={{
                    marginTop: "1.25rem",
                    backgroundColor: "#163321",
                    color: "white",
                    border: "none",
                    padding: "0.85rem 1.75rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Processing..." : "Start Queue"}
                </button>
              </div>
            )}
          </section>

          <section style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 20px 45px -30px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
              Status & Department
            </h2>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>
                Department
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <p style={{ margin: "0 0 1rem", color: "#475569" }}>
              Current status: <strong>{status}</strong>
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {["attending", "on_break", "emergency", "offline"].map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={actionLoading}
                  style={{
                    backgroundColor:
                      nextStatus === "attending"
                        ? "#00df81"
                        : nextStatus === "on_break"
                        ? "#facc15"
                        : nextStatus === "emergency"
                        ? "#f87171"
                        : "#94a3b8",
                    color: "#163321",
                    border: "none",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {nextStatus.replace("_", " ")}
                </button>
              ))}
            </div>

            {status === "on_break" && (
              <div style={{ marginTop: "1rem" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Break duration (minutes)
                </label>
                <input
                  type="number"
                  value={breakMinutes}
                  min={1}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                  }}
                />
              </div>
            )}
          </section>
        </div>

        <section style={{
          marginTop: "2rem",
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow: "0 20px 45px -30px rgba(0,0,0,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Queue</h2>
            <button
              onClick={fetchQueue}
              disabled={actionLoading}
              style={{
                backgroundColor: "#163321",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "999px",
                fontWeight: 600,
                cursor: actionLoading ? "not-allowed" : "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ marginTop: "1.25rem", display: "grid", gap: "1rem" }}>
            {queue.length === 0 ? (
              <p style={{ color: "#64748b" }}>No patients in queue yet.</p>
            ) : (
              queue.map((patient) => (
                <div
                  key={patient._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1.25rem",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{patient.fullName}</p>
                    <p style={{ margin: "0.25rem 0", color: "#64748b" }}>
                      Status: {patient.queueStatus}
                    </p>
                  </div>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    backgroundColor: "#163321",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}>
                    {patient.queuePosition}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
