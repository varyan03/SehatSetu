const express = require("express");
// Dynamic import for fetch compatibility or use native global fetch available in Node.js 18+

const router = express.Router();

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
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.detail || "Python service error",
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error connecting to Python service:", error);
    return res.status(500).json({ error: "Failed to connect to prediction service" });
  }
});

module.exports = router;
