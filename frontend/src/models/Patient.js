import mongoose from "mongoose";

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
  },
  { timestamps: true },
);

export default mongoose.models.Patient ||
  mongoose.model("Patient", PatientSchema);
