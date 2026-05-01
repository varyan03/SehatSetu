const express = require("express");
// Dynamic import for fetch compatibility or use native global fetch available in Node.js 18+

const router = express.Router();

const buildFallbackPrediction = (body = {}) => {
  const symptomText = body.text || "";
  const extractedSymptoms = Array.isArray(body.symptoms)
    ? body.symptoms
    : symptomText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const predictions = [
    {
      disease: "General Consultation",
      specialist: "General Physician",
      confidence: "0%",
    },
    {
      disease: "Primary Care Review",
      specialist: "General Physician",
      confidence: "0%",
    },
    {
      disease: "Initial Screening",
      specialist: "General Physician",
      confidence: "0%",
    },
  ];

  return {
    disease: predictions[0].disease,
    specialist: predictions[0].specialist,
    confidence: predictions[0].confidence,
    predictions,
    extracted_symptoms: extractedSymptoms,
    matched_symptoms: [],
    fallback: true,
  };
};

// POST /api/predict
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Forward the request to the Python Service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${pythonServiceUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn("Python service error, using fallback:", errorData.detail);
      return res.json(buildFallbackPrediction(body));
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error connecting to Python service:", error);
    return res.json(buildFallbackPrediction(req.body));
  }
});

module.exports = router;
