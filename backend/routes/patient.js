const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// POST /api/patient
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      dob,
      gender,
      contact,
      email,
      symptoms,
      department,
      predictedDisease,
      predictionConfidence,
      extractedSymptoms,
    } = req.body;

    // Validation
    if (!userId || !fullName || !dob || !gender || !contact || !symptoms || !department) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create patient record
    const patient = await Patient.create({
      userId,
      fullName,
      dob,
      gender,
      contact,
      email,
      symptoms,
      department,
      predictedDisease,
      predictionConfidence,
      extractedSymptoms,
    });

    return res.status(201).json({
      message: "Patient record created successfully",
      patient,
    });
  } catch (error) {
    console.error("Patient creation error:", error);
    return res.status(500).json({ error: "Failed to create patient record" });
  }
});

// GET /api/patient
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId) {
      await Patient.updateMany(
        {
          userId,
          queueStatus: "completed",
          appointmentStatus: { $ne: "Completed" },
        },
        { appointmentStatus: "Completed" }
      );
      const patients = await Patient.find({ userId })
        .populate("userId", "email role")
        .sort({ createdAt: -1 });
      return res.json({
        message: "User appointments fetched successfully",
        patients,
      });
    }

    // Admin/dashboard
    await Patient.updateMany(
      {
        queueStatus: "completed",
        appointmentStatus: { $ne: "Completed" },
      },
      { appointmentStatus: "Completed" }
    );
    const patients = await Patient.find()
      .populate("userId", "email role")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error("Patient fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch patient records" });
  }
});

// GET /api/patient/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Patient.findById(id).populate("userId", "email role");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// PATCH /api/patient/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentStatus, appointmentDate, assignedDoctor, notes } = req.body;

    const appointment = await Patient.findByIdAndUpdate(
      id,
      {
        ...(appointmentStatus && { appointmentStatus }),
        ...(appointmentDate && { appointmentDate }),
        ...(assignedDoctor && { assignedDoctor }),
        ...(notes && { notes }),
      },
      { new: true }
    ).populate("userId", "email role");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment update error:", error);
    return res.status(500).json({ error: "Failed to update appointment" });
  }
});

// DELETE /api/patient/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Patient.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Appointment delete error:", error);
    return res.status(500).json({ error: "Failed to delete appointment" });
  }
});

module.exports = router;
