const queueService = require("../services/queueService");
const Patient = require("../models/Patient");
const { sseService } = require("../services/sseService");
const { normalizeDepartment } = require("../utils/department");

exports.joinQueue = async (req, res) => {
  try {
    const { patientId, department, appointmentDate } = req.body;

    if (!patientId || !department || !appointmentDate) {
      return res.status(400).json({
        error: "Missing required fields: patientId, department, appointmentDate",
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await queueService.addToQueue(
      patientId,
      department,
      appointmentDate
    );

    await sseService.broadcastQueueUpdate(normalizeDepartment(result.department));

    return res.status(200).json({
      message: "Successfully joined queue",
      position: result.queuePosition,
      patient: result,
    });
  } catch (error) {
    console.error("Join queue error:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const queueInfo = await queueService.getPatientQueueInfo(patientId);

    if (!queueInfo) {
      return res.status(404).json({ error: "Patient not in queue" });
    }

    return res.status(200).json(queueInfo);
  } catch (error) {
    console.error("Get queue status error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getDepartmentQueue = async (req, res) => {
  try {
    const { department } = req.params;
    const { date } = req.query;

    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Only doctors can view the full queue" });
    }

    const queueDate = date ? new Date(date) : new Date();
    const queue = await queueService.getQueue(department, queueDate);

    return res.status(200).json({ queue, count: queue.length });
  } catch (error) {
    console.error("Get department queue error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.leaveQueue = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (patient.queueStatus !== "waiting") {
      return res
        .status(400)
        .json({ error: "Cannot leave queue - not in waiting status" });
    }

    const department = patient.department;
    const appointmentDate = patient.appointmentDate;

    patient.queueStatus = "cancelled";
    patient.queuePosition = null;
    await patient.save();

    await queueService.recalculatePositions(department, appointmentDate);

  await sseService.broadcastQueueUpdate(normalizeDepartment(department));

    return res.status(200).json({ message: "Successfully left the queue" });
  } catch (error) {
    console.error("Leave queue error:", error);
    return res.status(500).json({ error: error.message });
  }
};
