const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

let mongoServer;

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.DISABLE_QUEUE_TRANSACTIONS = "true";
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
  ]);
});

test("queue join and doctor next flow", async () => {
  const patientUser = await User.create({
    email: "patient@test.com",
    password: "hashed",
    role: "PATIENT",
  });

  const patient = await Patient.create({
    userId: patientUser._id,
    fullName: "Test Patient",
    dob: new Date("2000-01-01"),
    gender: "Male",
    contact: "1234567890",
    email: "patient@test.com",
    symptoms: "fever",
    department: "Cardiology",
  });

  const patientToken = signToken(patientUser._id.toString());

  const joinResponse = await request(app)
    .post("/api/queue/join")
    .set("Authorization", `Bearer ${patientToken}`)
    .send({
      patientId: patient._id.toString(),
      department: "Cardiology",
      appointmentDate: new Date().toISOString(),
    });

  expect(joinResponse.status).toBe(200);
  expect(joinResponse.body.position).toBe(1);

  const doctorUser = await User.create({
    email: "doctor@test.com",
    password: "hashed",
    role: "DOCTOR",
  });

  await Doctor.create({
    userId: doctorUser._id,
    fullName: "Dr Test",
    department: "Cardiology",
  });

  const doctorToken = signToken(doctorUser._id.toString());

  const nextResponse = await request(app)
    .patch("/api/doctor/next")
    .set("Authorization", `Bearer ${doctorToken}`);

  expect(nextResponse.status).toBe(200);
  expect(nextResponse.body.hasNext).toBe(true);

  const updatedPatient = await Patient.findById(patient._id);
  expect(updatedPatient.queueStatus).toBe("attending");
});
