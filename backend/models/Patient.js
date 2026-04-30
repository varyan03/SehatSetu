const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    // Prediction results
    predictedDisease: {
      type: String,
      default: null,
    },
    predictionConfidence: {
      type: String, // e.g., "95.5%"
      default: null,
    },
    extractedSymptoms: {
      type: [String],
      default: [],
    },
    // Appointment tracking fields (optional)
    appointmentStatus: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
      default: "Pending",
    },
    appointmentDate: {
      type: Date,
      default: null,
    },
    assignedDoctor: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    // Queue system fields (optional)
    queuePosition: {
      type: Number,
      default: null,
      index: true,
    },
    queueStatus: {
      type: String,
      enum: ["waiting", "attending", "completed", "bumped", "cancelled"],
      default: null,
    },
    queueDate: {
      type: Date,
      default: null,
    },
    estimatedTime: {
      type: Number,
      default: null,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    completedTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

PatientSchema.index({ department: 1, appointmentDate: 1, queuePosition: 1 });

module.exports = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
