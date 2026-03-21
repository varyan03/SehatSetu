import { connectDB } from "../../../../lib/db";
import Patient from "../../../../models/Patient";
import { NextResponse } from "next/server";

// GET - Fetch single appointment
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const appointment = await Patient.findById(id).populate("userId", "email role");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment (for booking slots, updating status)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { appointmentStatus, appointmentDate, assignedDoctor, notes } = await req.json();

    // Find and update appointment
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
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment update error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const appointment = await Patient.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Appointment delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
