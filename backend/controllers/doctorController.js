const queueService = require("../services/queueService");
const Doctor = require("../models/Doctor");

exports.moveToNext = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Only doctors can perform this action" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const result = await queueService.moveToNext(doctor._id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Move to next error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, breakDuration } = req.body;

    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Only doctors can update status" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const validStatuses = ["attending", "on_break", "emergency", "offline"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    doctor.status = status;

    if (status === "on_break" && breakDuration) {
      doctor.breakEndTime = new Date(Date.now() + breakDuration * 60000);
    } else {
      doctor.breakEndTime = null;
    }

    await doctor.save();

    return res.status(200).json({
      message: "Status updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getCurrentPatient = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(403)
        .json({ error: "Only doctors can view current patient" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id }).populate(
      "currentPatient"
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    return res.status(200).json({
      currentPatient: doctor.currentPatient,
      status: doctor.status,
    });
  } catch (error) {
    console.error("Get current patient error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ error: "Only doctors can access profile" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    return res.status(200).json({ doctor });
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({ error: error.message });
  }
};
