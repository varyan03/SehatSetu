const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const { sseService } = require("../services/sseService");
const { normalizeDepartment } = require("../utils/department");

exports.streamQueueUpdates = async (req, res) => {
  try {
    const { patientId } = req.params;
    const token =
      req.query.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!patient.queueStatus || patient.queueStatus === "completed") {
      return res.status(400).json({ error: "Patient not in active queue" });
    }

  const department = normalizeDepartment(patient.department);
  sseService.addConnection(patientId, department, res, req);

    const queueService = require("../services/queueService");
    const queueInfo = await queueService.getPatientQueueInfo(patientId);

    if (queueInfo) {
      sseService.sendEvent(res, "queue_update", queueInfo);
    }
  } catch (error) {
    console.error("SSE stream error:", error);
    return res.status(500).json({ error: error.message });
  }
};
