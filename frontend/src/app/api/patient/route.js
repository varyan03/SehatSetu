import { connectDB } from "../../../lib/db";
import Patient from "../../../models/Patient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

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
      extractedSymptoms
    } = await req.json();

    // Validation
    if (!userId || !fullName || !dob || !gender || !contact || !symptoms || !department) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Create patient record (allow multiple forms per user)
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
      extractedSymptoms
    });

    return NextResponse.json(
      {
        message: "Patient record created successfully",
        patient,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Patient creation error:", error);
    return NextResponse.json(
      { error: "Failed to create patient record" },
      { status: 500 },
    );
  }
}

// GET - Fetch patient records
export async function GET(req) {
  try {
    await connectDB();

    // Get userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // If userId provided, fetch only that user's appointments
    if (userId) {
      const patients = await Patient.find({ userId }).populate("userId", "email role").sort({ createdAt: -1 });
      return NextResponse.json({
        message: "User appointments fetched successfully",
        patients,
      });
    }

    // If no userId, fetch all patients (for admin/dashboard)
    const patients = await Patient.find().populate("userId", "email role").sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error("Patient fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient records" },
      { status: 500 },
    );
  }
}
