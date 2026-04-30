const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "General",
        "General Medicine",
      ],
    },
    status: {
      type: String,
      enum: ["attending", "on_break", "emergency", "offline"],
      default: "offline",
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    breakEndTime: {
      type: Date,
      default: null,
    },
    isJuniorDoctor: {
      type: Boolean,
      default: false,
    },
    shiftStart: {
      type: String,
      default: "09:00",
    },
    shiftEnd: {
      type: String,
      default: "17:00",
    },
    averageConsultationTime: {
      type: Number,
      default: 15,
    },
  },
  { timestamps: true }
);

DoctorSchema.index({ department: 1, status: 1 });

module.exports = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
