"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const departments = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Psychiatry",
  "Emergency Medicine",
];

export default function PatientFormPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contact: "",
    symptoms: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData((prev) => ({
      ...prev,
      email: userData.email,
    }));
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [prediction, setPrediction] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !formData.fullName ||
      !formData.dob ||
      !formData.gender ||
      !formData.contact ||
      !formData.symptoms ||
      !formData.department
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // 1. Get Prediction
      let predictionResult = null;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const predictResponse = await fetch(`${API_URL}/api/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: formData.symptoms }),
        });

        if (predictResponse.ok) {
          predictionResult = await predictResponse.json();
          setPrediction(predictionResult);
        } else {
          console.warn("Prediction API failed, proceeding without prediction");
        }
      } catch (predError) {
        console.error("Prediction error:", predError);
        // Continue even if prediction fails
      }

      // 2. Submit Patient Data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const response = await fetch(`${API_URL}/api/patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          predictedDisease: predictionResult?.disease || null,
          predictionConfidence: predictionResult?.confidence || null,
          extractedSymptoms: predictionResult?.extracted_symptoms || [],
          topPredictions: predictionResult?.predictions || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit form");
        return;
      }

      if (data.patient?._id) {
        localStorage.setItem("latestPatientId", data.patient._id);
      }

      setSubmitted(true);
      // Wait a bit longer so user can see the prediction before redirect
      setTimeout(() => {
        router.push("/waiting-room");
      }, 5000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#EBF1F1" 
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(0, 223, 129, 0.1)",
          borderTop: "3px solid #00df81",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundColor: "#EBF1F1",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Typography */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(8rem, 25vw, 35rem)",
          fontWeight: "900",
          color: "rgba(255, 255, 255, 0.6)",
          whiteSpace: "nowrap",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "0.1em"
        }}>
          SUCCESS
        </div>

        <div className="card" style={{ 
          maxWidth: "600px", 
          width: "100%", 
          position: "relative", 
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "2.5rem",
          padding: "3.5rem 2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
          textAlign: "center"
        }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            backgroundColor: "#ecfdf5", 
            borderRadius: "2rem", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "2.5rem",
            margin: "0 auto 1.5rem"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style={{ color: "#163321", marginBottom: "0.75rem", fontSize: "2.25rem", fontWeight: "700" }}>Submission Successful</h1>
          <p style={{ color: "#475569", marginBottom: "2.5rem", fontSize: "1.1rem" }}>
            Your medical details have been securely recorded. Our AI has analyzed your symptoms.
          </p>

          {prediction && (
            <div style={{ marginBottom: "2.5rem" }}>
              <h3 style={{ color: "#163321", marginBottom: "1.5rem", fontWeight: "700", fontSize: "1.25rem", textAlign: "left" }}>Recommended Specialists</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {prediction.predictions && prediction.predictions.map((pred, index) => (
                  <div key={index} style={{
                    backgroundColor: "white",
                    padding: "1.5rem",
                    borderRadius: "1.5rem",
                    textAlign: "left",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                    transition: "transform 0.2s",
                    cursor: "default"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ 
                      width: "50px", 
                      height: "50px", 
                      backgroundColor: "#EBF1F1", 
                      borderRadius: "1rem", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      color: "#00df81",
                      fontSize: "1.25rem",
                      fontWeight: "bold"
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#163321" }}>
                        {pred.specialist || "General Physician"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Condition match:</span>
                        <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "600", backgroundColor: "#f0fdf4", padding: "2px 8px", borderRadius: "9999px" }}>
                          {pred.disease}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#64748b", fontSize: "0.95rem" }}>
            <div style={{
              width: "20px",
              height: "20px",
              border: "2px solid rgba(0, 223, 129, 0.1)",
              borderTop: "2px solid #00df81",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            Redirecting to your dashboard...
          </div>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
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
        fontSize: "clamp(7rem, 20vw, 30rem)",
        fontWeight: "900",
        color: "rgba(255, 255, 255, 0.6)",
        whiteSpace: "nowrap",
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        letterSpacing: "0.5em"
      }}>
        INTAKE
      </div> */}

      <div className="container" style={{ maxWidth: "800px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
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
            <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#163321", letterSpacing: "-1px" }}>Medical Intake</h1>
            <p style={{ color: "#475569", fontSize: "1.1rem" }}>
              Help us understand your health better
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.5rem", fontWeight: "400", color: "#3d8a62" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              <path d="M9 12h6"></path>
              <path d="M12 9v6"></path>
            </svg>
            <strong>Sehat</strong>Setu
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "2.5rem",
          padding: "3.5rem 3rem",
          boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.05)",
          display: "grid",
          gap: "2rem"
        }}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={{ 
                width: "100%",
                padding: "1.1rem 1.4rem",
                borderRadius: "1.25rem",
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Email (Read-only) */}
            <div className="form-group">
              <label htmlFor="email" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Email Address</label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                style={{ 
                  width: "100%",
                  padding: "1.1rem 1.4rem",
                  borderRadius: "1.25rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  fontSize: "1rem",
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            {/* Contact Number */}
            <div className="form-group">
              <label htmlFor="contact" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Contact Number *</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="Phone number"
                style={{ 
                  width: "100%",
                  padding: "1.1rem 1.4rem",
                  borderRadius: "1.25rem",
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
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dob" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Date of Birth *</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                style={{ 
                  width: "100%",
                  padding: "1.1rem 1.4rem",
                  borderRadius: "1.25rem",
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

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ 
                  width: "100%",
                  padding: "1.1rem 1.4rem",
                  borderRadius: "1.25rem",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  outline: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1.25rem center",
                  backgroundSize: "1.25rem"
                }}
                onFocus={(e) => e.target.style.borderColor = "#00df81"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="department" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Select Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              style={{ 
                width: "100%",
                padding: "1.1rem 1.4rem",
                borderRadius: "1.25rem",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                fontSize: "1rem",
                transition: "all 0.2s",
                outline: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1.25rem center",
                backgroundSize: "1.25rem"
              }}
              onFocus={(e) => e.target.style.borderColor = "#00df81"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="symptoms" style={{ color: "#163321", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.75rem", display: "block" }}>Describe Your Symptoms *</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              required
              placeholder="Please describe what you are feeling in detail..."
              style={{ 
                width: "100%",
                padding: "1.1rem 1.4rem",
                borderRadius: "1.25rem",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                fontSize: "1rem",
                transition: "all 0.2s",
                outline: "none",
                minHeight: "150px",
                resize: "vertical"
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
              padding: "1.25rem", 
              borderRadius: "1.25rem", 
              fontSize: "1.1rem", 
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              border: "none",
              marginTop: "1rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#00df81"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#163321"}
          >
            {loading ? "Analyzing Symptoms..." : "Submit for Analysis"}
          </button>
        </form>

        <div style={{
          marginTop: "3rem",
          padding: "2rem",
          backgroundColor: "rgba(219, 234, 254, 0.5)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(147, 197, 253, 0.3)",
          borderRadius: "1.5rem",
          color: "#1e40af",
          display: "flex",
          gap: "1.25rem"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <p style={{ fontWeight: "700", marginBottom: "0.25rem" }}>Secure & Private</p>
            <p style={{ fontSize: "0.95rem", margin: 0, opacity: 0.8, lineHeight: "1.5" }}>
              Your health data is encrypted and only visible to authorized healthcare professionals matching your needs.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          form { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
