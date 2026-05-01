"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const POLL_INTERVAL_MS = 12000;

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) {
    return {
      status: response.status,
      raw: "",
      url: response.url,
    };
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      error: "Unexpected response from server",
      raw: text,
      status: response.status,
      url: response.url,
    };
  }
};

const buildErrorMessage = (data, fallback) => {
  if (data?.error) {
    const urlInfo = data.url ? ` (${data.url})` : "";
    return data.raw
      ? `${data.error}${urlInfo} (status ${data.status || "unknown"}): ${data.raw}`
      : `${data.error}${urlInfo}`;
  }
  if (data?.raw) {
    const urlInfo = data.url ? ` (${data.url})` : "";
    return `Unexpected response${urlInfo} (status ${data.status || "unknown"}): ${data.raw}`;
  }
  return fallback;
};

const isUnauthorized = (response) => response.status === 401 || response.status === 403;

const isCompletedAppointment = (record) =>
  record?.appointmentStatus === "Completed" || record?.queueStatus === "completed";

const parseEventData = (event) => {
  if (!event?.data) return null;
  try {
    return JSON.parse(event.data);
  } catch (error) {
    return null;
  }
};

export default function WaitingRoomPage() {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const fetchPatientById = useCallback(async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/patient/${id}`);
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      throw new Error(buildErrorMessage(data, "Failed to fetch appointment"));
    }
    return data.appointment;
  }, []);

  const fetchLatestPatient = useCallback(
    async (currentUser) => {
      setLoading(true);
      setError("");
      try {
        const storedPatientId = localStorage.getItem("latestPatientId");
        if (storedPatientId) {
          const latestPatient = await fetchPatientById(storedPatientId);
          if (!isCompletedAppointment(latestPatient)) {
            setPatient(latestPatient);
            return;
          }
          localStorage.removeItem("latestPatientId");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/patient?userId=${currentUser.id}`
        );
        const data = await parseJsonSafely(response);
        if (!response.ok) {
          throw new Error(buildErrorMessage(data, "Failed to fetch appointments"));
        }

        const latest = data.patients?.find(
          (record) => !isCompletedAppointment(record)
        ) || null;
        setPatient(latest);
      } catch (err) {
        console.error("Fetch patient error:", err);
        setError(err.message || "Failed to load appointment");
      } finally {
        setLoading(false);
      }
    },
    [fetchPatientById]
  );

  const fetchQueueInfo = useCallback(
    async (patientId) => {
      if (!patientId) return;
      const token = getToken();
      if (!token) {
        setError("Please log in again to view queue status.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/queue/status/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        setQueueInfo(null);
        return;
      }

      const data = await parseJsonSafely(response);
      if (isUnauthorized(response)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please log in again.");
      }
      if (!response.ok) {
        throw new Error(buildErrorMessage(data, "Failed to fetch queue status"));
      }

      setQueueInfo(data);
    },
    [getToken]
  );

  useEffect(() => {
    if (!user) return;
    fetchLatestPatient(user);
  }, [user, fetchLatestPatient]);

  useEffect(() => {
    if (!patient?._id) return;
    fetchQueueInfo(patient._id).catch((err) => {
      console.error("Queue status error:", err);
      if (err.message?.includes("Session expired")) {
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to fetch queue status");
    });
  }, [patient, fetchQueueInfo, router]);

  useEffect(() => {
    if (!patient?._id || !user || !queueInfo) return undefined;
    const token = getToken();
    if (!token) return undefined;

    const streamUrl = `${API_BASE_URL}/api/queue/stream/${patient._id}?token=${encodeURIComponent(
      token
    )}`;
    const eventSource = new EventSource(streamUrl);

    const handleQueueUpdate = (event) => {
      const data = parseEventData(event);
      if (data) {
        setQueueInfo(data);
      }
    };

    const handleDoctorStatus = (event) => {
      const data = parseEventData(event);
      if (!data) return;
      setQueueInfo((prev) =>
        prev
          ? {
              ...prev,
              doctorStatus: data.status || prev.doctorStatus,
              breakEndTime: data.breakEndTime ?? prev.breakEndTime,
            }
          : prev
      );
    };

    const handleCompleted = () => {
      setQueueInfo(null);
      fetchLatestPatient(user).catch((err) => {
        console.error("Refresh after completion error:", err);
      });
    };

    eventSource.addEventListener("queue_update", handleQueueUpdate);
    eventSource.addEventListener("doctor_status", handleDoctorStatus);
    eventSource.addEventListener("appointment_completed", handleCompleted);

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [patient, user, queueInfo, getToken, fetchLatestPatient]);

  useEffect(() => {
    if (!patient?._id) return undefined;
    const interval = setInterval(() => {
      fetchQueueInfo(patient._id).catch((err) => {
        console.error("Queue refresh error:", err);
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [patient, fetchQueueInfo]);

  const handleJoinQueue = async () => {
    if (!patient) return;
    setActionLoading(true);
    setError("");

    try {
      let appointmentDate = patient.appointmentDate;
      if (!appointmentDate) {
        appointmentDate = new Date().toISOString();
        const updateResponse = await fetch(
          `${API_BASE_URL}/api/patient/${patient._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentDate,
              appointmentStatus: "Scheduled",
            }),
          }
        );
        const updateData = await parseJsonSafely(updateResponse);
        if (!updateResponse.ok) {
          throw new Error(buildErrorMessage(updateData, "Failed to set appointment date"));
        }
        setPatient((prev) => ({
          ...prev,
          appointmentDate,
          appointmentStatus: "Scheduled",
        }));
      }

      const token = getToken();
      if (!token) {
        throw new Error("Please log in again to join the queue.");
      }

      const response = await fetch(`${API_BASE_URL}/api/queue/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patient._id,
          department: patient.department,
          appointmentDate,
        }),
      });

      const data = await parseJsonSafely(response);
      if (isUnauthorized(response)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please log in again.");
      }
      if (!response.ok) {
        throw new Error(buildErrorMessage(data, "Failed to join queue"));
      }

      await fetchQueueInfo(patient._id);
    } catch (err) {
      console.error("Join queue error:", err);
      if (err.message?.includes("Session expired")) {
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to join queue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!patient?._id) return;
    setActionLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Please log in again to update the queue.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/queue/leave/${patient._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await parseJsonSafely(response);
      if (isUnauthorized(response)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please log in again.");
      }
      if (!response.ok) {
        throw new Error(buildErrorMessage(data, "Failed to leave queue"));
      }

      setQueueInfo(null);
    } catch (err) {
      console.error("Leave queue error:", err);
      if (err.message?.includes("Session expired")) {
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to leave queue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!patient?._id) return;
    setActionLoading(true);
    try {
      await fetchQueueInfo(patient._id);
    } catch (err) {
      console.error("Refresh error:", err);
      setError(err.message || "Failed to refresh status");
    } finally {
      setActionLoading(false);
    }
  };

  const estimatedTimeLabel = useMemo(() => {
    if (!queueInfo) return "Join the queue to see an ETA.";
    if (queueInfo.estimatedTime === null) return "Awaiting doctor availability";
    if (queueInfo.estimatedTime <= 0) return "You are next in line";
    return `${queueInfo.estimatedTime} min estimated wait`;
  }, [queueInfo]);

  const queueStatusLabel = useMemo(() => {
    if (!queueInfo) return "Not in queue";
    if (queueInfo.status === "attending") return "Now being attended";
    if (queueInfo.status === "waiting") return "Waiting";
    return queueInfo.status || "Status unavailable";
  }, [queueInfo]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EBF1F1",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid rgba(0, 223, 129, 0.2)",
            borderTop: "3px solid #00df81",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#EBF1F1",
        padding: "3.5rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <Link
              href="/dashboard"
              style={{
                color: "#10b981",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "1rem",
              }}
            >
              ← Back to Dashboard
            </Link>
            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: 700,
                color: "#163321",
                marginBottom: "0.5rem",
              }}
            >
              Patient Waiting Room
            </h1>
            <p style={{ color: "#64748b", fontSize: "1.05rem" }}>
              Track your queue position and get real-time updates while you wait.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={actionLoading || !patient}
            style={{
              backgroundColor: "#163321",
              color: "white",
              border: "none",
              padding: "0.85rem 1.6rem",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: 600,
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              padding: "1rem 1.25rem",
              borderRadius: "1rem",
              marginBottom: "2rem",
            }}
          >
            {error}
          </div>
        )}

        {!patient && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2.5rem",
              borderRadius: "1.5rem",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#163321", fontSize: "1.5rem" }}>
              No intake form found
            </h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              Complete your medical intake to join the queue.
            </p>
            <Link
              href="/patient-form"
              style={{
                backgroundColor: "#163321",
                color: "white",
                padding: "0.9rem 1.8rem",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Start Intake
            </Link>
          </div>
        )}

        {patient && (
          <div style={{ display: "grid", gap: "2rem" }}>
            <div
              style={{
                backgroundColor: "white",
                padding: "2.5rem",
                borderRadius: "1.75rem",
                border: "1px solid #e2e8f0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "2rem",
              }}
            >
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Patient
                </p>
                <h3
                  style={{
                    margin: "0.4rem 0 0",
                    color: "#163321",
                    fontSize: "1.35rem",
                  }}
                >
                  {patient.fullName}
                </h3>
                <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
                  Department: {patient.department}
                </p>
              </div>
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Queue Status
                </p>
                <h3
                  style={{
                    margin: "0.4rem 0 0",
                    color: "#163321",
                    fontSize: "1.35rem",
                    textTransform: "capitalize",
                  }}
                >
                  {queueStatusLabel}
                </h3>
                <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
                  Doctor: {queueInfo?.doctorStatus || "offline"}
                </p>
              </div>
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Estimated Wait
                </p>
                <h3
                  style={{
                    margin: "0.4rem 0 0",
                    color: "#163321",
                    fontSize: "1.35rem",
                  }}
                >
                  {estimatedTimeLabel}
                </h3>
                <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
                  Patients ahead: {queueInfo?.patientsAhead ?? "-"}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#163321",
                color: "white",
                padding: "2.5rem",
                borderRadius: "1.75rem",
                display: "grid",
                gap: "1.5rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.4rem" }}>
                Queue Actions
              </h3>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Join the queue when you are ready. If you need to step out, you
                can leave and rejoin later.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <button
                  onClick={handleJoinQueue}
                  disabled={actionLoading || queueInfo?.status === "waiting" || queueInfo?.status === "attending"}
                  style={{
                    backgroundColor: "#00df81",
                    color: "#163321",
                    border: "none",
                    padding: "0.85rem 1.8rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  {actionLoading ? "Updating..." : "Join Queue"}
                </button>
                <button
                  onClick={handleLeaveQueue}
                  disabled={actionLoading || !queueInfo}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.6)",
                    padding: "0.85rem 1.8rem",
                    borderRadius: "999px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  Leave Queue
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
