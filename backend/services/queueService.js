const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { normalizeDepartment, buildDepartmentFilter } = require("../utils/department");
const { sseService } = require("./sseService");

const shouldUseTransactions = () => {
  if (process.env.DISABLE_QUEUE_TRANSACTIONS === "true") {
    return false;
  }

  const uri = process.env.MONGODB_URI || "";
  const isAtlas = uri.startsWith("mongodb+srv://");
  const hasReplicaSet = uri.includes("replicaSet=");

  return isAtlas || hasReplicaSet;
};

const getDayRange = (date) => {
  const base = new Date(date);
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const isSameDay = (left, right) => {
  if (!left || !right) return false;
  const { start, end } = getDayRange(left);
  const compare = new Date(right);
  return compare >= start && compare <= end;
};

class QueueService {
  async addToQueue(patientId, department, appointmentDate) {
    const useTransactions = shouldUseTransactions();
    const session = useTransactions ? await mongoose.startSession() : null;
    if (session) {
      session.startTransaction();
    }

    try {
      const patientQuery = Patient.findById(patientId);
      const patient = session ? await patientQuery.session(session) : await patientQuery;
      if (!patient) {
        throw new Error("Patient not found");
      }

      if (patient.queueStatus === "waiting" || patient.queueStatus === "attending") {
        throw new Error("Patient already in queue");
      }

      if (!appointmentDate) {
        throw new Error("Appointment date is required");
      }

      const apptDate = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (apptDate < today) {
        throw new Error("Appointment date cannot be in the past");
      }

      const completedSameDay = isSameDay(patient.appointmentDate, apptDate);
      if (
        (patient.queueStatus === "completed" ||
          patient.appointmentStatus === "Completed") &&
        completedSameDay
      ) {
        throw new Error("Appointment already completed");
      }

      const targetDepartment = normalizeDepartment(
        department || patient.department
      );
      if (!targetDepartment) {
        throw new Error("Department is required");
      }

      const { start, end } = getDayRange(apptDate);

      const lastPatientQuery = Patient.findOne({
        department: targetDepartment,
        appointmentDate: { $gte: start, $lt: end },
        queueStatus: { $in: ["waiting", "attending"] },
      })
        .sort({ queuePosition: -1 })
        .limit(1);
      const lastPatient = session
        ? await lastPatientQuery.session(session)
        : await lastPatientQuery;

      const newPosition = lastPatient ? lastPatient.queuePosition + 1 : 1;

      patient.queuePosition = newPosition;
      patient.queueStatus = "waiting";
      patient.queueDate = new Date();
      patient.appointmentDate = apptDate;
      patient.department = targetDepartment;

      if (session) {
        await patient.save({ session });
        await session.commitTransaction();
        session.endSession();
      } else {
        await patient.save();
      }

      return patient;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }

  async getQueue(department, date) {
    const { start, end } = getDayRange(date);
    const departmentFilter = buildDepartmentFilter(department);

    return Patient.find({
      department: departmentFilter,
      appointmentDate: { $gte: start, $lt: end },
      queueStatus: { $in: ["waiting", "attending"] },
    })
      .sort({ queuePosition: 1 })
      .select("fullName queuePosition queueStatus estimatedTime");
  }

  async moveToNext(doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    let completedPatientId = null;
    if (doctor.currentPatient) {
      completedPatientId = doctor.currentPatient.toString();
      await Patient.findByIdAndUpdate(doctor.currentPatient, {
        queueStatus: "completed",
        appointmentStatus: "Completed",
        completedTime: new Date(),
        queuePosition: null,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextPatient = await Patient.findOne({
      department: buildDepartmentFilter(doctor.department),
      appointmentDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      queueStatus: "waiting",
    })
      .sort({ queuePosition: 1 })
      .limit(1);

    if (!nextPatient) {
      doctor.currentPatient = null;
      doctor.status = "offline";
      await doctor.save();
      return { message: "No more patients in queue", hasNext: false };
    }

    nextPatient.queueStatus = "attending";
    nextPatient.checkInTime = new Date();
    await nextPatient.save();

    doctor.currentPatient = nextPatient._id;
    doctor.status = "attending";
    await doctor.save();

    await this.recalculatePositions(doctor.department, today);

    const normalizedDepartment = normalizeDepartment(doctor.department);
    await sseService.broadcastQueueUpdate(normalizedDepartment);

    if (completedPatientId) {
      sseService.notifyPatient(completedPatientId, "appointment_completed", {
        message: "Your appointment has been completed.",
        completedTime: new Date().toISOString(),
      });
    }

    return {
      message: "Moved to next patient",
      hasNext: true,
      nextPatient,
    };
  }

  async recalculatePositions(department, date) {
    const { start, end } = getDayRange(date);
    const departmentFilter = buildDepartmentFilter(department);

    const waitingPatients = await Patient.find({
      department: departmentFilter,
      appointmentDate: { $gte: start, $lt: end },
      queueStatus: "waiting",
    }).sort({ queuePosition: 1 });

    for (let i = 0; i < waitingPatients.length; i += 1) {
      waitingPatients[i].queuePosition = i + 1;
      await waitingPatients[i].save();
    }

    return waitingPatients.length;
  }

  async calculateEstimatedTime(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient || patient.queueStatus !== "waiting") {
      return 0;
    }

    if (!patient.queuePosition) {
      return null;
    }

    const doctor = await Doctor.findOne({
      department: buildDepartmentFilter(patient.department),
      status: { $in: ["attending", "on_break"] },
    });

    if (!doctor) {
      return null;
    }

    let estimatedMinutes =
      (patient.queuePosition - 1) * doctor.averageConsultationTime;

    if (doctor.status === "on_break" && doctor.breakEndTime) {
      const breakMinutesLeft = Math.max(
        0,
        Math.floor((doctor.breakEndTime - new Date()) / 60000)
      );
      estimatedMinutes += breakMinutesLeft;
    }

    return estimatedMinutes;
  }

  async getPatientQueueInfo(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient || !patient.queueStatus || patient.queueStatus === "completed") {
      return null;
    }

    const doctor = await Doctor.findOne({
      department: buildDepartmentFilter(patient.department),
    });
    const estimatedTime = await this.calculateEstimatedTime(patientId);

    return {
      position: patient.queuePosition,
      status: patient.queueStatus,
      estimatedTime,
      doctorStatus: doctor ? doctor.status : "offline",
      breakEndTime: doctor ? doctor.breakEndTime : null,
      patientsAhead: Math.max(0, (patient.queuePosition || 0) - 1),
    };
  }
}

module.exports = new QueueService();
