# SehatSetu Queue System - Complete Implementation Guide

## 📋 Table of Contents
1. [Phase 1: Database Schema & Models](#phase-1-database-schema--models)
2. [Phase 2: Backend Queue Management](#phase-2-backend-queue-management)
3. [Phase 3: Server-Sent Events (SSE) Implementation](#phase-3-server-sent-events-sse-implementation)
4. [Phase 4: Doctor Control Panel](#phase-4-doctor-control-panel)
5. [Phase 5: Frontend Waiting Room](#phase-5-frontend-waiting-room)
6. [Phase 6: Priority Bumping System](#phase-6-priority-bumping-system)
7. [Phase 7: Edge Case Handling](#phase-7-edge-case-handling)
8. [Phase 8: Testing Strategy](#phase-8-testing-strategy)

---

## Phase 1: Database Schema & Models

### Step 1.1: Update Patient Model

**File**: `backend/models/Patient.js`

**What to Add**:
```javascript
const patientSchema = new mongoose.Schema({
  // ... existing fields (userId, fullName, dob, gender, contact, email, symptoms, department)
  
  // NEW QUEUE FIELDS
  queuePosition: {
    type: Number,
    default: null, // null means not in queue
    index: true // Important for fast queries
  },
  
  queueStatus: {
    type: String,
    enum: ['waiting', 'attending', 'completed', 'bumped', 'cancelled'],
    default: null
  },
  
  queueDate: {
    type: Date,
    default: null // The date they joined the queue
  },
  
  appointmentDate: {
    type: Date,
    default: null // The date of their appointment (for next-day bumping)
  },
  
  estimatedTime: {
    type: Number,
    default: null // Estimated minutes until their turn
  },
  
  checkInTime: {
    type: Date,
    default: null // When they actually checked in
  },
  
  completedTime: {
    type: Date,
    default: null // When doctor finished with them
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient queue queries
patientSchema.index({ department: 1, appointmentDate: 1, queuePosition: 1 });
```

**Why These Fields**:
- `queuePosition`: Track exact position in line (1, 2, 3...)
- `queueStatus`: Track current state in the queue lifecycle
- `queueDate`: Know when they joined (for analytics)
- `appointmentDate`: Critical for next-day bumping logic
- `estimatedTime`: Show patients approximate wait time
- `checkInTime` & `completedTime`: Analytics and audit trail

**Edge Cases Covered**:
- Index on `queuePosition` ensures fast lookups when reordering
- Compound index allows efficient queries like "all cardiology patients for tomorrow"
- `null` defaults allow existing patients to continue working

---

### Step 1.2: Create Doctor Model

**File**: `backend/models/Doctor.js`

**Why We Need This**: Track doctor availability and status separately from users.

```javascript
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  fullName: {
    type: String,
    required: true
  },
  
  department: {
    type: String,
    required: true,
    enum: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General'] // Match your departments
  },
  
  status: {
    type: String,
    enum: ['attending', 'on_break', 'emergency', 'offline'],
    default: 'offline'
  },
  
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  
  breakEndTime: {
    type: Date,
    default: null // When the break will end
  },
  
  isJuniorDoctor: {
    type: Boolean,
    default: false // For emergency fallback
  },
  
  shiftStart: {
    type: String, // Format: "09:00"
    default: "09:00"
  },
  
  shiftEnd: {
    type: String, // Format: "17:00"
    default: "17:00"
  },
  
  averageConsultationTime: {
    type: Number,
    default: 15 // Minutes per patient (for wait time calculation)
  }
}, {
  timestamps: true
});

doctorSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
```

**Edge Cases Covered**:
- `currentPatient` prevents double-booking
- `breakEndTime` enables countdown feature
- `isJuniorDoctor` enables emergency fallback logic
- `averageConsultationTime` calculated dynamically for accurate estimates

---

## Phase 2: Backend Queue Management

### Step 2.1: Queue Service (Core Logic)

**File**: `backend/services/queueService.js`

**Purpose**: Centralize all queue operations to avoid duplicate logic.

```javascript
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

class QueueService {
  
  /**
   * Add a patient to the queue
   * Edge Cases: 
   * - Patient already in queue
   * - No doctor available
   * - Appointment date in the past
   */
  async addToQueue(patientId, department, appointmentDate) {
    // Validation
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Check if already in queue
    if (patient.queueStatus === 'waiting' || patient.queueStatus === 'attending') {
      throw new Error('Patient already in queue');
    }
    
    // Validate appointment date
    const apptDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (apptDate < today) {
      throw new Error('Appointment date cannot be in the past');
    }
    
    // Find the last position in queue for this department and date
    const lastPatient = await Patient.findOne({
      department,
      appointmentDate: {
        $gte: new Date(apptDate.setHours(0, 0, 0, 0)),
        $lt: new Date(apptDate.setHours(23, 59, 59, 999))
      },
      queueStatus: { $in: ['waiting', 'attending'] }
    })
    .sort({ queuePosition: -1 })
    .limit(1);
    
    const newPosition = lastPatient ? lastPatient.queuePosition + 1 : 1;
    
    // Update patient
    patient.queuePosition = newPosition;
    patient.queueStatus = 'waiting';
    patient.queueDate = new Date();
    patient.appointmentDate = apptDate;
    patient.department = department;
    
    await patient.save();
    
    return patient;
  }
  
  /**
   * Get current queue for a department
   */
  async getQueue(department, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const queue = await Patient.find({
      department,
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      queueStatus: { $in: ['waiting', 'attending'] }
    })
    .sort({ queuePosition: 1 })
    .select('fullName queuePosition queueStatus estimatedTime');
    
    return queue;
  }
  
  /**
   * Move to next patient
   * Edge Cases:
   * - No patients in queue
   * - Doctor already with a patient
   * - Position gaps in queue
   */
  async moveToNext(doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    // Mark current patient as completed
    if (doctor.currentPatient) {
      await Patient.findByIdAndUpdate(doctor.currentPatient, {
        queueStatus: 'completed',
        completedTime: new Date(),
        queuePosition: null
      });
    }
    
    // Find next patient
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextPatient = await Patient.findOne({
      department: doctor.department,
      appointmentDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      queueStatus: 'waiting'
    })
    .sort({ queuePosition: 1 })
    .limit(1);
    
    if (!nextPatient) {
      // No more patients
      doctor.currentPatient = null;
      doctor.status = 'offline';
      await doctor.save();
      
      return { message: 'No more patients in queue', hasNext: false };
    }
    
    // Update next patient to attending
    nextPatient.queueStatus = 'attending';
    nextPatient.checkInTime = new Date();
    await nextPatient.save();
    
    // Update doctor
    doctor.currentPatient = nextPatient._id;
    doctor.status = 'attending';
    await doctor.save();
    
    // Decrement all waiting patients' positions
    await this.recalculatePositions(doctor.department, today);
    
    return { 
      message: 'Moved to next patient', 
      hasNext: true,
      nextPatient 
    };
  }
  
  /**
   * Recalculate queue positions after removal
   * Ensures no gaps (e.g., if position 3 is removed, position 4 becomes 3)
   */
  async recalculatePositions(department, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const waitingPatients = await Patient.find({
      department,
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
      queueStatus: 'waiting'
    })
    .sort({ queuePosition: 1 });
    
    // Reassign positions sequentially
    for (let i = 0; i < waitingPatients.length; i++) {
      waitingPatients[i].queuePosition = i + 1;
      await waitingPatients[i].save();
    }
    
    return waitingPatients.length;
  }
  
  /**
   * Calculate estimated wait time for a patient
   */
  async calculateEstimatedTime(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient || patient.queueStatus !== 'waiting') {
      return 0;
    }
    
    const doctor = await Doctor.findOne({
      department: patient.department,
      status: { $in: ['attending', 'on_break'] }
    });
    
    if (!doctor) {
      return null; // Doctor offline
    }
    
    // Position 1 = next, so (position - 1) * avg time
    let estimatedMinutes = (patient.queuePosition - 1) * doctor.averageConsultationTime;
    
    // Add break time if doctor is on break
    if (doctor.status === 'on_break' && doctor.breakEndTime) {
      const breakMinutesLeft = Math.max(
        0,
        Math.floor((doctor.breakEndTime - new Date()) / 60000)
      );
      estimatedMinutes += breakMinutesLeft;
    }
    
    return estimatedMinutes;
  }
  
  /**
   * Get patient's position info
   */
  async getPatientQueueInfo(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient || !patient.queueStatus || patient.queueStatus === 'completed') {
      return null;
    }
    
    const doctor = await Doctor.findOne({ department: patient.department });
    const estimatedTime = await this.calculateEstimatedTime(patientId);
    
    return {
      position: patient.queuePosition,
      status: patient.queueStatus,
      estimatedTime,
      doctorStatus: doctor ? doctor.status : 'offline',
      breakEndTime: doctor?.breakEndTime,
      patientsAhead: Math.max(0, patient.queuePosition - 1)
    };
  }
}

module.exports = new QueueService();
```

**Why This Design**:
- **Single Responsibility**: Each method does one thing
- **Edge Case Handling**: Validates inputs, handles empty queues
- **Position Gaps**: `recalculatePositions` prevents gaps in queue numbering
- **Estimated Time**: Factors in breaks and average consultation time

---

### Step 2.2: Queue Controller (HTTP Endpoints)

**File**: `backend/controllers/queueController.js`

```javascript
const queueService = require('../services/queueService');
const Patient = require('../models/Patient');

/**
 * POST /api/queue/join
 * Patient joins the queue
 */
exports.joinQueue = async (req, res) => {
  try {
    const { patientId, department, appointmentDate } = req.body;
    
    // Validate required fields
    if (!patientId || !department || !appointmentDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, department, appointmentDate' 
      });
    }
    
    // Verify patient belongs to logged-in user
    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await queueService.addToQueue(patientId, department, appointmentDate);
    
    res.status(200).json({
      message: 'Successfully joined queue',
      position: result.queuePosition,
      patient: result
    });
    
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/queue/status/:patientId
 * Get patient's current queue status
 */
exports.getQueueStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify patient belongs to logged-in user
    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const queueInfo = await queueService.getPatientQueueInfo(patientId);
    
    if (!queueInfo) {
      return res.status(404).json({ error: 'Patient not in queue' });
    }
    
    res.status(200).json(queueInfo);
    
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/queue/department/:department
 * Get full queue for a department (doctor view)
 */
exports.getDepartmentQueue = async (req, res) => {
  try {
    const { department } = req.params;
    const { date } = req.query; // Optional: default to today
    
    // Verify user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can view the full queue' });
    }
    
    const queueDate = date ? new Date(date) : new Date();
    const queue = await queueService.getQueue(department, queueDate);
    
    res.status(200).json({ queue, count: queue.length });
    
  } catch (error) {
    console.error('Get department queue error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/queue/leave/:patientId
 * Patient leaves the queue
 */
exports.leaveQueue = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (patient.queueStatus !== 'waiting') {
      return res.status(400).json({ error: 'Cannot leave queue - not in waiting status' });
    }
    
    const department = patient.department;
    const appointmentDate = patient.appointmentDate;
    
    // Remove from queue
    patient.queueStatus = 'cancelled';
    patient.queuePosition = null;
    await patient.save();
    
    // Recalculate positions
    await queueService.recalculatePositions(department, appointmentDate);
    
    res.status(200).json({ message: 'Successfully left the queue' });
    
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**Edge Cases Handled**:
- Authorization checks (patient can only view their own status)
- Role-based access (only doctors see full queue)
- Missing fields validation
- Queue recalculation after leaving

---

### Step 2.3: Doctor Controller

**File**: `backend/controllers/doctorController.js`

```javascript
const queueService = require('../services/queueService');
const Doctor = require('../models/Doctor');

/**
 * PATCH /api/doctor/next
 * Move to next patient in queue
 */
exports.moveToNext = async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can perform this action' });
    }
    
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    const result = await queueService.moveToNext(doctor._id);
    
    // Trigger SSE broadcast (implemented in Phase 3)
    const { sseService } = require('../services/sseService');
    sseService.broadcastQueueUpdate(doctor.department);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Move to next error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /api/doctor/status
 * Update doctor status (on_break, emergency, attending, offline)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status, breakDuration } = req.body; // breakDuration in minutes
    
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can update status' });
    }
    
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    // Validate status
    const validStatuses = ['attending', 'on_break', 'emergency', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    doctor.status = status;
    
    // Set break end time
    if (status === 'on_break' && breakDuration) {
      doctor.breakEndTime = new Date(Date.now() + breakDuration * 60000);
    } else {
      doctor.breakEndTime = null;
    }
    
    await doctor.save();
    
    // Broadcast status change
    const { sseService } = require('../services/sseService');
    sseService.broadcastDoctorStatusChange(doctor.department, {
      status: doctor.status,
      breakEndTime: doctor.breakEndTime
    });
    
    res.status(200).json({ 
      message: 'Status updated successfully',
      doctor 
    });
    
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/doctor/current
 * Get current patient being attended
 */
exports.getCurrentPatient = async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Only doctors can view current patient' });
    }
    
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('currentPatient');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    res.status(200).json({ 
      currentPatient: doctor.currentPatient,
      status: doctor.status 
    });
    
  } catch (error) {
    console.error('Get current patient error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## Phase 3: Server-Sent Events (SSE) Implementation

### Step 3.1: SSE Service

**File**: `backend/services/sseService.js`

**Purpose**: Manage real-time connections to patients.

```javascript
class SSEService {
  constructor() {
    // Store active connections: { patientId: response_object }
    this.connections = new Map();
    
    // Store department subscriptions: { department: Set(patientIds) }
    this.departmentSubscriptions = new Map();
  }
  
  /**
   * Add a new SSE connection
   */
  addConnection(patientId, department, res) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    });
    
    // Send initial connection message
    this.sendEvent(res, 'connected', { 
      message: 'Connected to queue updates',
      timestamp: new Date().toISOString()
    });
    
    // Store connection
    this.connections.set(patientId, res);
    
    // Add to department subscription
    if (!this.departmentSubscriptions.has(department)) {
      this.departmentSubscriptions.set(department, new Set());
    }
    this.departmentSubscriptions.get(department).add(patientId);
    
    console.log(`SSE: Patient ${patientId} connected to ${department}`);
    
    // Handle client disconnect
    req.on('close', () => {
      this.removeConnection(patientId, department);
    });
  }
  
  /**
   * Remove a connection
   */
  removeConnection(patientId, department) {
    this.connections.delete(patientId);
    
    if (this.departmentSubscriptions.has(department)) {
      this.departmentSubscriptions.get(department).delete(patientId);
      
      // Clean up empty department sets
      if (this.departmentSubscriptions.get(department).size === 0) {
        this.departmentSubscriptions.delete(department);
      }
    }
    
    console.log(`SSE: Patient ${patientId} disconnected from ${department}`);
  }
  
  /**
   * Send an event to a specific connection
   */
  sendEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  
  /**
   * Broadcast queue update to all patients in a department
   */
  async broadcastQueueUpdate(department) {
    const queueService = require('./queueService');
    
    if (!this.departmentSubscriptions.has(department)) {
      return; // No active connections
    }
    
    const patientIds = Array.from(this.departmentSubscriptions.get(department));
    
    for (const patientId of patientIds) {
      const res = this.connections.get(patientId);
      if (!res) continue;
      
      try {
        // Get updated queue info for this patient
        const queueInfo = await queueService.getPatientQueueInfo(patientId);
        
        if (queueInfo) {
          this.sendEvent(res, 'queue_update', queueInfo);
        }
        
      } catch (error) {
        console.error(`SSE: Error sending update to patient ${patientId}:`, error);
      }
    }
    
    console.log(`SSE: Broadcasted queue update to ${patientIds.length} patients in ${department}`);
  }
  
  /**
   * Broadcast doctor status change
   */
  broadcastDoctorStatusChange(department, statusData) {
    if (!this.departmentSubscriptions.has(department)) {
      return;
    }
    
    const patientIds = Array.from(this.departmentSubscriptions.get(department));
    
    for (const patientId of patientIds) {
      const res = this.connections.get(patientId);
      if (!res) continue;
      
      this.sendEvent(res, 'doctor_status', statusData);
    }
    
    console.log(`SSE: Broadcasted doctor status to ${patientIds.length} patients in ${department}`);
  }
  
  /**
   * Send a notification to a specific patient
   */
  notifyPatient(patientId, event, data) {
    const res = this.connections.get(patientId);
    if (!res) {
      console.log(`SSE: Patient ${patientId} not connected, cannot notify`);
      return false;
    }
    
    this.sendEvent(res, event, data);
    return true;
  }
  
  /**
   * Get active connection count
   */
  getConnectionCount(department = null) {
    if (department) {
      return this.departmentSubscriptions.get(department)?.size || 0;
    }
    return this.connections.size;
  }
}

module.exports = { sseService: new SSEService() };
```

**Edge Cases Handled**:
- Connection cleanup on client disconnect
- Graceful error handling if patient not connected
- Department-based filtering for efficient broadcasts
- Nginx buffering disabled for real-time delivery

---

### Step 3.2: SSE Controller

**File**: `backend/controllers/sseController.js`

```javascript
const { sseService } = require('../services/sseService');
const Patient = require('../models/Patient');

/**
 * GET /api/queue/stream/:patientId
 * Establish SSE connection for queue updates
 */
exports.streamQueueUpdates = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify patient exists and belongs to user
    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Verify patient is in queue
    if (!patient.queueStatus || patient.queueStatus === 'completed') {
      return res.status(400).json({ error: 'Patient not in active queue' });
    }
    
    // Add SSE connection
    sseService.addConnection(patientId, patient.department, res, req);
    
    // Send initial queue status
    const queueService = require('../services/queueService');
    const queueInfo = await queueService.getPatientQueueInfo(patientId);
    
    if (queueInfo) {
      sseService.sendEvent(res, 'queue_update', queueInfo);
    }
    
  } catch (error) {
    console.error('SSE stream error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

### Step 3.3: Update Routes

**File**: `backend/routes/queueRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const sseController = require('../controllers/sseController');
const authMiddleware = require('../middleware/authMiddleware'); // Your JWT middleware

// Patient routes
router.post('/join', authMiddleware, queueController.joinQueue);
router.get('/status/:patientId', authMiddleware, queueController.getQueueStatus);
router.delete('/leave/:patientId', authMiddleware, queueController.leaveQueue);

// SSE route
router.get('/stream/:patientId', authMiddleware, sseController.streamQueueUpdates);

// Doctor routes
router.get('/department/:department', authMiddleware, queueController.getDepartmentQueue);

module.exports = router;
```

**File**: `backend/routes/doctorRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

router.patch('/next', authMiddleware, doctorController.moveToNext);
router.patch('/status', authMiddleware, doctorController.updateStatus);
router.get('/current', authMiddleware, doctorController.getCurrentPatient);

module.exports = router;
```

**File**: `backend/index.js` (Update)**

```javascript
// ... existing imports
const queueRoutes = require('./routes/queueRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

// ... existing middleware

// Add new routes
app.use('/api/queue', queueRoutes);
app.use('/api/doctor', doctorRoutes);

// ... rest of your server setup
```

---

## Phase 4: Doctor Control Panel

### Step 4.1: Doctor Dashboard Backend Summary

You now have these endpoints:
- `PATCH /api/doctor/next` - Move to next patient
- `PATCH /api/doctor/status` - Update status (break, emergency, etc.)
- `GET /api/doctor/current` - Get current patient
- `GET /api/queue/department/:department` - View full queue

---

### Step 4.2: Frontend Doctor Component

**File**: `frontend/src/app/doctor/dashboard/page.jsx`

```jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorDashboard() {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState('offline');
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentPatient();
    fetchQueue();
  }, []);

  const fetchCurrentPatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/doctor/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPatient(res.data.currentPatient);
      setStatus(res.data.status);
    } catch (error) {
      console.error('Error fetching current patient:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      // Replace 'Cardiology' with actual doctor's department
      const res = await axios.get('/api/queue/department/Cardiology', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(res.data.queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handleNextPatient = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/doctor/next', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data
      await fetchCurrentPatient();
      await fetchQueue();
      
    } catch (error) {
      console.error('Error moving to next patient:', error);
      alert(error.response?.data?.error || 'Failed to move to next patient');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { status: newStatus };
      
      if (newStatus === 'on_break') {
        payload.breakDuration = breakMinutes;
      }
      
      await axios.patch('/api/doctor/status', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus(newStatus);
      alert(`Status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      
      {/* Current Patient */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Patient</h2>
        {currentPatient ? (
          <div>
            <p><strong>Name:</strong> {currentPatient.fullName}</p>
            <p><strong>Symptoms:</strong> {currentPatient.symptoms}</p>
            <button
              onClick={handleNextPatient}
              disabled={loading}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Next Patient'}
            </button>
          </div>
        ) : (
          <p>No patient currently being attended.</p>
        )}
      </div>
      
      {/* Status Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleStatusChange('attending')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Start Attending
          </button>
          <button
            onClick={() => handleStatusChange('on_break')}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Take Break
          </button>
          <button
            onClick={() => handleStatusChange('emergency')}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Emergency
          </button>
          <button
            onClick={() => handleStatusChange('offline')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Go Offline
          </button>
        </div>
        
        {status === 'on_break' && (
          <div>
            <label className="block mb-2">Break Duration (minutes):</label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="border rounded px-3 py-2 w-32"
            />
          </div>
        )}
      </div>
      
      {/* Queue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Queue ({queue.length} patients)</h2>
        <div className="space-y-2">
          {queue.map((patient, idx) => (
            <div key={patient._id} className="flex items-center gap-4 p-3 border rounded">
              <span className="font-bold text-lg">{idx + 1}</span>
              <div>
                <p className="font-medium">{patient.fullName}</p>
                <p className="text-sm text-gray-600">
                  Status: {patient.queueStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 5: Frontend Waiting Room

### Step 5.1: Patient Waiting Room Component

**File**: `frontend/src/app/waiting-room/[patientId]/page.jsx`

```jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function WaitingRoom() {
  const { patientId } = useParams();
  
  const [queueInfo, setQueueInfo] = useState(null);
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const eventSourceRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize notification audio
    audioRef.current = new Audio('/notification.mp3'); // Add a notification sound
    
    // Fetch initial status
    fetchInitialStatus();
    
    // Connect to SSE stream
    connectToSSE();
    
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    
    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [patientId]);

  const fetchInitialStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/queue/status/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch queue status');
      }
      
      const data = await res.json();
      setQueueInfo(data);
      setDoctorStatus(data.doctorStatus);
      
    } catch (err) {
      console.error('Error fetching initial status:', err);
      setError('Failed to load queue status');
    }
  };

  const connectToSSE = () => {
    const token = localStorage.getItem('token');
    
    // Create EventSource with JWT in URL (since EventSource doesn't support headers)
    const eventSource = new EventSource(
      `/api/queue/stream/${patientId}?token=${token}`
    );
    
    eventSource.onopen = () => {
      console.log('SSE connection established');
      setConnected(true);
      setError(null);
    };
    
    eventSource.addEventListener('connected', (e) => {
      console.log('Connected to queue updates:', e.data);
    });
    
    eventSource.addEventListener('queue_update', (e) => {
      const data = JSON.parse(e.data);
      console.log('Queue update received:', data);
      
      // Check if it's their turn
      if (data.position === 1 && queueInfo?.position !== 1) {
        notifyPatient();
      }
      
      setQueueInfo(data);
    });
    
    eventSource.addEventListener('doctor_status', (e) => {
      const data = JSON.parse(e.data);
      console.log('Doctor status update:', data);
      setDoctorStatus(data.status);
    });
    
    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setConnected(false);
      setError('Connection lost. Retrying...');
      
      // EventSource automatically reconnects, but we can add custom logic here
    };
    
    eventSourceRef.current = eventSource;
  };

  const notifyPatient = () => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
    }
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('It\'s Your Turn!', {
        body: 'The doctor is ready to see you now.',
        icon: '/logo.png'
      });
    }
  };

  const getStatusColor = () => {
    if (!queueInfo) return 'bg-gray-500';
    
    if (queueInfo.position === 1 || queueInfo.status === 'attending') {
      return 'bg-green-500'; // GREEN: Your turn
    }
    
    if (doctorStatus === 'on_break' || doctorStatus === 'emergency') {
      return 'bg-red-500'; // RED: Not attending
    }
    
    return 'bg-yellow-500'; // YELLOW: In queue
  };

  const getStatusMessage = () => {
    if (!queueInfo) return 'Loading...';
    
    if (queueInfo.status === 'attending') {
      return '🟢 Please proceed to the consultation room';
    }
    
    if (queueInfo.position === 1) {
      return '🟢 You\'re next! Please be ready.';
    }
    
    if (doctorStatus === 'on_break') {
      const breakEnd = new Date(queueInfo.breakEndTime);
      const minutesLeft = Math.max(0, Math.floor((breakEnd - new Date()) / 60000));
      return `🔴 Doctor is on break. Will resume in ${minutesLeft} minutes.`;
    }
    
    if (doctorStatus === 'emergency') {
      return '🔴 Doctor is attending an emergency. Please wait.';
    }
    
    if (doctorStatus === 'offline') {
      return '🔴 Doctor is currently unavailable.';
    }
    
    return `🟡 ${queueInfo.patientsAhead} patient(s) ahead of you`;
  };

  const formatEstimatedTime = (minutes) => {
    if (!minutes) return 'Calculating...';
    if (minutes < 60) return `~${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m`;
  };

  if (error && !queueInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Connection Status */}
      <div className="mb-4">
        {connected ? (
          <span className="text-green-600">● Connected</span>
        ) : (
          <span className="text-red-600">● Disconnected</span>
        )}
      </div>
      
      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Status Light */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full ${getStatusColor()} animate-pulse`}></div>
        </div>
        
        {/* Status Message */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {getStatusMessage()}
        </h1>
        
        {/* Queue Info */}
        {queueInfo && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Your Position</p>
              <p className="text-4xl font-bold text-center">{queueInfo.position}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Estimated Wait Time</p>
              <p className="text-xl font-semibold text-center">
                {formatEstimatedTime(queueInfo.estimatedTime)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Doctor Status</p>
              <p className="text-lg font-medium text-center capitalize">
                {doctorStatus?.replace('_', ' ') || 'Unknown'}
              </p>
            </div>
          </div>
        )}
        
        {/* Leave Queue Button */}
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to leave the queue?')) {
              try {
                const token = localStorage.getItem('token');
                await fetch(`/api/queue/leave/${patientId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
                });
                window.location.href = '/dashboard';
              } catch (err) {
                alert('Failed to leave queue');
              }
            }
          }}
          className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
        >
          Leave Queue
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-600 max-w-md">
        <p>This page updates automatically. Please keep this tab open.</p>
        <p className="mt-2">You will be notified when it's your turn.</p>
      </div>
    </div>
  );
}
```

**Edge Cases Handled**:
- Auto-reconnection on connection loss
- Browser and audio notifications when turn arrives
- Real-time countdown for break time
- Graceful error display
- Leave queue functionality

---

## Phase 6: Priority Bumping System

### Step 6.1: Bumping Service

**File**: `backend/services/bumpingService.js`

**Purpose**: Handle end-of-day patient queue bumping using a stack.

```javascript
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

class BumpingService {
  
  /**
   * Bump remaining patients to next day
   * Uses Stack (LIFO) to preserve order
   * 
   * @param {string} department - Department to process
   * @param {Date} currentDate - Current date (shift ending)
   * @param {Date} nextDate - Next working day
   * @returns {Object} - Summary of bumped patients
   */
  async bumpPatientsToNextDay(department, currentDate, nextDate) {
    try {
      // 1. Find all waiting patients for today
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const remainingPatients = await Patient.find({
        department,
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        queueStatus: 'waiting'
      })
      .sort({ queuePosition: 1 }) // Ascending order: [P1, P2, P3]
      .exec();
      
      if (remainingPatients.length === 0) {
        return { 
          message: 'No patients to bump',
          bumpedCount: 0 
        };
      }
      
      console.log(`Bumping ${remainingPatients.length} patients from ${department}`);
      
      // 2. Use Stack (LIFO) by reversing the array
      // Array: [P1, P2, P3] -> Stack (bottom to top): [P1, P2, P3]
      // We'll "pop" from the end: P3, then P2, then P1
      const stack = [...remainingPatients]; // Clone array
      
      // 3. Find existing patients for next day
      const nextDayStart = new Date(nextDate);
      nextDayStart.setHours(0, 0, 0, 0);
      
      const nextDayEnd = new Date(nextDate);
      nextDayEnd.setHours(23, 59, 59, 999);
      
      const existingNextDayPatients = await Patient.find({
        department,
        appointmentDate: { $gte: nextDayStart, $lt: nextDayEnd },
        queueStatus: { $in: ['waiting', 'bumped'] }
      })
      .sort({ queuePosition: 1 })
      .exec();
      
      // 4. Pop from stack and insert at front
      let insertPosition = 1;
      const bumpedPatients = [];
      
      while (stack.length > 0) {
        const patient = stack.pop(); // LIFO: removes from end (P3, then P2, then P1)
        
        patient.queuePosition = insertPosition;
        patient.queueStatus = 'bumped';
        patient.appointmentDate = nextDate;
        
        await patient.save();
        bumpedPatients.push(patient);
        
        insertPosition++;
      }
      
      // 5. Shift existing next-day patients down
      for (const existingPatient of existingNextDayPatients) {
        existingPatient.queuePosition += bumpedPatients.length;
        await existingPatient.save();
      }
      
      console.log(`Successfully bumped ${bumpedPatients.length} patients to ${nextDate}`);
      
      return {
        message: 'Patients successfully bumped to next day',
        bumpedCount: bumpedPatients.length,
        bumpedPatients: bumpedPatients.map(p => ({
          id: p._id,
          name: p.fullName,
          newPosition: p.queuePosition
        })),
        nextDate
      };
      
    } catch (error) {
      console.error('Bumping error:', error);
      throw error;
    }
  }
  
  /**
   * Auto-bump at end of shift
   * Called by a scheduled job (cron)
   */
  async autoBumpEndOfShift(department) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await this.bumpPatientsToNextDay(department, today, tomorrow);
  }
  
  /**
   * Emergency bump - when doctor goes to ER and no junior available
   */
  async emergencyBump(department) {
    // Check for junior doctor
    const juniorDoctor = await Doctor.findOne({
      department,
      isJuniorDoctor: true,
      status: { $in: ['attending', 'offline'] }
    });
    
    if (juniorDoctor) {
      // Junior available - assign them
      juniorDoctor.status = 'attending';
      await juniorDoctor.save();
      
      return {
        message: 'Junior doctor assigned',
        juniorDoctor: juniorDoctor.fullName
      };
    }
    
    // No junior - bump to tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await this.bumpPatientsToNextDay(department, today, tomorrow);
    
    return {
      ...result,
      reason: 'Emergency - no junior doctor available'
    };
  }
}

module.exports = new BumpingService();
```

**Why Stack (LIFO)**:
- Original queue: [P1, P2, P3] (positions 1, 2, 3)
- Push to stack: [P1, P2, P3] (P3 is on top)
- Pop and insert:
  - Pop P3 → Insert at position 1
  - Pop P2 → Insert at position 2
  - Pop P1 → Insert at position 3
- Wait... this reverses them! ❌

**CORRECTION**: We need to pop in reverse order. Fixed implementation:

```javascript
// Corrected approach:
const stack = [...remainingPatients].reverse(); // [P3, P2, P1]

let insertPosition = 1;

while (stack.length > 0) {
  const patient = stack.pop(); // Pops P1 first, then P2, then P3
  patient.queuePosition = insertPosition++;
  // Result: P1=1, P2=2, P3=3 ✓
}
```

---

### Step 6.2: Bumping Controller

**File**: `backend/controllers/bumpingController.js`

```javascript
const bumpingService = require('../services/bumpingService');

/**
 * POST /api/admin/bump
 * Manually trigger bumping (admin only)
 */
exports.manualBump = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { department, currentDate, nextDate } = req.body;
    
    if (!department || !currentDate || !nextDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: department, currentDate, nextDate' 
      });
    }
    
    const result = await bumpingService.bumpPatientsToNextDay(
      department,
      new Date(currentDate),
      new Date(nextDate)
    );
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Manual bump error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/emergency-bump
 * Trigger emergency bump when doctor goes to ER
 */
exports.emergencyBump = async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { department } = req.body;
    
    if (!department) {
      return res.status(400).json({ error: 'Department required' });
    }
    
    const result = await bumpingService.emergencyBump(department);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Emergency bump error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

### Step 6.3: Scheduled Bumping (Cron Job)

**File**: `backend/jobs/queueJobs.js`

**Purpose**: Auto-bump at end of day for all departments.

```javascript
const cron = require('node-cron');
const bumpingService = require('../services/bumpingService');
const Doctor = require('../models/Doctor');

/**
 * Schedule daily bumping at 11:59 PM
 */
function scheduleDailyBumping() {
  // Run at 11:59 PM every day
  cron.schedule('59 23 * * *', async () => {
    console.log('Running daily queue bumping job...');
    
    try {
      // Get all unique departments
      const departments = await Doctor.distinct('department');
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      for (const department of departments) {
        console.log(`Processing bumping for ${department}...`);
        
        const result = await bumpingService.bumpPatientsToNextDay(
          department,
          today,
          tomorrow
        );
        
        console.log(`${department}: ${result.bumpedCount} patients bumped`);
      }
      
      console.log('Daily bumping job completed');
      
    } catch (error) {
      console.error('Daily bumping job error:', error);
    }
  });
  
  console.log('Daily queue bumping job scheduled for 11:59 PM');
}

module.exports = { scheduleDailyBumping };
```

**File**: `backend/index.js` (Update)

```javascript
// ... existing imports
const { scheduleDailyBumping } = require('./jobs/queueJobs');

// ... existing setup

// Start cron jobs
scheduleDailyBumping();

// ... server start
```

**Install cron package**:
```bash
npm install node-cron
```

---

## Phase 7: Edge Case Handling

### Edge Case 1: Doctor Disconnects Mid-Session

**Problem**: Doctor closes browser while attending a patient.

**Solution**: Add a "Resume Session" endpoint.

**File**: `backend/controllers/doctorController.js` (Add)

```javascript
/**
 * GET /api/doctor/resume
 * Resume interrupted session
 */
exports.resumeSession = async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Doctors only' });
    }
    
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('currentPatient');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // If there's a current patient still in "attending" status
    if (doctor.currentPatient && doctor.currentPatient.queueStatus === 'attending') {
      return res.status(200).json({
        resumed: true,
        currentPatient: doctor.currentPatient,
        message: 'Session resumed'
      });
    }
    
    // No active session
    return res.status(200).json({
      resumed: false,
      message: 'No active session to resume'
    });
    
  } catch (error) {
    console.error('Resume session error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

### Edge Case 2: Patient Closes Browser

**Problem**: Patient closes waiting room, SSE connection lost.

**Solution**: 
- SSE auto-reconnects (built into EventSource)
- On reconnect, send current queue status immediately
- No data loss - queue position stored in database

**Already handled in**: `backend/services/sseService.js` (connection cleanup on close)

---

### Edge Case 3: Duplicate Positions

**Problem**: Race condition - two patients get same position.

**Solution**: Use MongoDB transactions for atomic updates.

**File**: `backend/services/queueService.js` (Update `addToQueue`)

```javascript
async addToQueue(patientId, department, appointmentDate) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const patient = await Patient.findById(patientId).session(session);
    if (!patient) throw new Error('Patient not found');
    
    // Check if already in queue (with lock)
    if (patient.queueStatus === 'waiting' || patient.queueStatus === 'attending') {
      throw new Error('Patient already in queue');
    }
    
    // ... validation code ...
    
    // Find last position WITH LOCK
    const lastPatient = await Patient.findOne({
      department,
      appointmentDate: {
        $gte: new Date(apptDate.setHours(0, 0, 0, 0)),
        $lt: new Date(apptDate.setHours(23, 59, 59, 999))
      },
      queueStatus: { $in: ['waiting', 'attending'] }
    })
    .sort({ queuePosition: -1 })
    .limit(1)
    .session(session); // Lock this read
    
    const newPosition = lastPatient ? lastPatient.queuePosition + 1 : 1;
    
    // Update patient
    patient.queuePosition = newPosition;
    patient.queueStatus = 'waiting';
    patient.queueDate = new Date();
    patient.appointmentDate = apptDate;
    patient.department = department;
    
    await patient.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return patient;
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
```

---

### Edge Case 4: SSE Token Authentication

**Problem**: EventSource doesn't support custom headers for JWT.

**Solution**: Pass token as query parameter (already done in frontend).

**Update SSE Controller** to validate token from query:

**File**: `backend/controllers/sseController.js` (Update)

```javascript
exports.streamQueueUpdates = async (req, res) => {
  try {
    const { patientId } = req.params;
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify JWT
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    
    // ... rest of authentication logic ...
    
    const patient = await Patient.findById(patientId);
    if (!patient || patient.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // ... rest of SSE setup ...
    
  } catch (error) {
    console.error('SSE stream error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

### Edge Case 5: Network Interruption

**Problem**: Patient's internet drops, SSE disconnects.

**Solution**: EventSource automatically reconnects with built-in retry.

**Enhancement** - Add reconnection UI indicator:

**File**: `frontend/src/app/waiting-room/[patientId]/page.jsx` (Update)

```jsx
// In the EventSource error handler:
eventSource.onerror = (err) => {
  console.error('SSE error:', err);
  setConnected(false);
  
  // Show reconnection toast
  setError('Connection lost. Reconnecting...');
  
  // Clear error after reconnection
  setTimeout(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      setError(null);
      setConnected(true);
    }
  }, 3000);
};
```

---

## Phase 8: Testing Strategy

### Step 8.1: Unit Tests

**File**: `backend/tests/queueService.test.js`

```javascript
const queueService = require('../services/queueService');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

describe('Queue Service', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  });
  
  afterAll(async () => {
    // Cleanup
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    // Clear collections
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
  });
  
  test('Should add patient to empty queue at position 1', async () => {
    const patient = await Patient.create({
      userId: new mongoose.Types.ObjectId(),
      fullName: 'Test Patient',
      email: 'test@example.com',
      department: 'Cardiology'
    });
    
    const result = await queueService.addToQueue(
      patient._id,
      'Cardiology',
      new Date()
    );
    
    expect(result.queuePosition).toBe(1);
    expect(result.queueStatus).toBe('waiting');
  });
  
  test('Should add patient to queue at correct position', async () => {
    // Create first patient
    const patient1 = await Patient.create({
      userId: new mongoose.Types.ObjectId(),
      fullName: 'Patient 1',
      email: 'p1@example.com',
      department: 'Cardiology',
      queuePosition: 1,
      queueStatus: 'waiting',
      appointmentDate: new Date()
    });
    
    // Add second patient
    const patient2 = await Patient.create({
      userId: new mongoose.Types.ObjectId(),
      fullName: 'Patient 2',
      email: 'p2@example.com',
      department: 'Cardiology'
    });
    
    const result = await queueService.addToQueue(
      patient2._id,
      'Cardiology',
      new Date()
    );
    
    expect(result.queuePosition).toBe(2);
  });
  
  test('Should prevent duplicate queue entry', async () => {
    const patient = await Patient.create({
      userId: new mongoose.Types.ObjectId(),
      fullName: 'Test Patient',
      email: 'test@example.com',
      department: 'Cardiology',
      queuePosition: 1,
      queueStatus: 'waiting',
      appointmentDate: new Date()
    });
    
    await expect(
      queueService.addToQueue(patient._id, 'Cardiology', new Date())
    ).rejects.toThrow('Patient already in queue');
  });
  
  test('Should recalculate positions after removal', async () => {
    // Create 3 patients
    const patients = await Patient.create([
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'P1',
        email: 'p1@example.com',
        department: 'Cardiology',
        queuePosition: 1,
        queueStatus: 'waiting',
        appointmentDate: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'P2',
        email: 'p2@example.com',
        department: 'Cardiology',
        queuePosition: 2,
        queueStatus: 'waiting',
        appointmentDate: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: 'P3',
        email: 'p3@example.com',
        department: 'Cardiology',
        queuePosition: 3,
        queueStatus: 'waiting',
        appointmentDate: new Date()
      }
    ]);
    
    // Remove patient 2
    patients[1].queueStatus = 'completed';
    patients[1].queuePosition = null;
    await patients[1].save();
    
    // Recalculate
    await queueService.recalculatePositions('Cardiology', new Date());
    
    // Check positions
    const p1 = await Patient.findById(patients[0]._id);
    const p3 = await Patient.findById(patients[2]._id);
    
    expect(p1.queuePosition).toBe(1);
    expect(p3.queuePosition).toBe(2); // Should be 2, not 3
  });
});
```

---

### Step 8.2: Integration Tests

**File**: `backend/tests/queueFlow.integration.test.js`

```javascript
const request = require('supertest');
const app = require('../index'); // Your Express app
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

describe('Queue Flow Integration', () => {
  let patientToken, doctorToken, patientId, doctorId;
  
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    
    // Create test user and patient
    const user = await User.create({
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'PATIENT'
    });
    
    const patient = await Patient.create({
      userId: user._id,
      fullName: 'Test Patient',
      email: 'patient@test.com',
      department: 'Cardiology'
    });
    
    patientId = patient._id;
    patientToken = 'generated_jwt_token'; // Use actual JWT generation
    
    // Create test doctor
    const doctorUser = await User.create({
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'DOCTOR'
    });
    
    const doctor = await Doctor.create({
      userId: doctorUser._id,
      fullName: 'Dr. Test',
      department: 'Cardiology'
    });
    
    doctorId = doctor._id;
    doctorToken = 'generated_doctor_jwt_token';
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  test('Full queue flow: join -> wait -> attend -> complete', async () => {
    // 1. Patient joins queue
    const joinRes = await request(app)
      .post('/api/queue/join')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: patientId.toString(),
        department: 'Cardiology',
        appointmentDate: new Date()
      });
    
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.position).toBe(1);
    
    // 2. Check queue status
    const statusRes = await request(app)
      .get(`/api/queue/status/${patientId}`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.position).toBe(1);
    expect(statusRes.body.status).toBe('waiting');
    
    // 3. Doctor moves to next patient
    const nextRes = await request(app)
      .patch('/api/doctor/next')
      .set('Authorization', `Bearer ${doctorToken}`);
    
    expect(nextRes.status).toBe(200);
    expect(nextRes.body.hasNext).toBe(true);
    
    // 4. Verify patient status changed to attending
    const updatedPatient = await Patient.findById(patientId);
    expect(updatedPatient.queueStatus).toBe('attending');
    
    // 5. Complete session
    const completeRes = await request(app)
      .patch('/api/doctor/next')
      .set('Authorization', `Bearer ${doctorToken}`);
    
    expect(completeRes.status).toBe(200);
    
    const completedPatient = await Patient.findById(patientId);
    expect(completedPatient.queueStatus).toBe('completed');
  });
});
```

---

### Step 8.3: Manual Testing Checklist

**Print this checklist and test each scenario:**

#### Patient Flow
- [ ] Patient can join queue
- [ ] Patient sees correct position
- [ ] Position updates when someone ahead completes
- [ ] Estimated time updates correctly
- [ ] "Your turn" notification appears when position = 1
- [ ] Patient can leave queue
- [ ] SSE reconnects after network interruption
- [ ] Page works on mobile

#### Doctor Flow
- [ ] Doctor sees full queue list
- [ ] "Next Patient" button works
- [ ] Current patient displays correctly
- [ ] Status changes (attending, break, emergency, offline) work
- [ ] Break countdown displays for patients
- [ ] Queue updates broadcast to all patients

#### Bumping System
- [ ] Manual bump moves patients to next day in correct order
- [ ] Auto-bump runs at 11:59 PM
- [ ] Bumped patients appear at top of next day's queue
- [ ] Original order preserved (P1, P2, P3 stays P1, P2, P3)
- [ ] Emergency bump finds junior doctor if available
- [ ] Emergency bump bumps patients if no junior available

#### Edge Cases
- [ ] Duplicate position prevented
- [ ] Patient can't join queue twice
- [ ] Doctor can resume interrupted session
- [ ] Empty queue handled gracefully
- [ ] SSE token authentication works
- [ ] Position gaps filled after recalculation

---

## Phase 9: Deployment Checklist

### Environment Variables

Add to `.env`:
```env
# Existing variables
PORT=5001
MONGODB_URI=mongodb://...
JWT_SECRET=your_jwt_secret
PYTHON_SERVICE_URL=http://localhost:8000

# New for queue system
ENABLE_QUEUE_CRON=true
SSE_HEARTBEAT_INTERVAL=30000
MAX_SSE_CONNECTIONS=1000
```

### Production Considerations

1. **Reverse Proxy (Nginx)**:
   ```nginx
   location /api/queue/stream {
       proxy_pass http://localhost:5001;
       proxy_http_version 1.1;
       proxy_set_header Connection '';
       proxy_buffering off;
       proxy_cache off;
       chunked_transfer_encoding off;
   }
   ```

2. **Load Balancing**:
   - Use sticky sessions for SSE connections
   - Store queue state in database, not memory
   - Use Redis for pub/sub if scaling across servers

3. **Monitoring**:
   - Track active SSE connections
   - Monitor bumping job success rate
   - Alert on queue position gaps

4. **Backup Strategy**:
   - Daily database backups
   - Log all queue state changes
   - Retain bumped patient records for audit

---

## Summary

This implementation guide covers:

✅ **Database Models**: Patient queue fields, Doctor model
✅ **Queue Management**: Add, remove, reorder, calculate estimates
✅ **SSE System**: Real-time updates, reconnection, broadcasting
✅ **Doctor Controls**: Next patient, status changes, current patient
✅ **Patient UI**: Waiting room, live updates, notifications
✅ **Bumping System**: Stack-based priority preservation
✅ **Edge Cases**: Disconnections, duplicates, race conditions, interruptions
✅ **Testing**: Unit tests, integration tests, manual checklist
✅ **Deployment**: Environment setup, production config

**Next Steps**:
1. Start with Phase 1 (Database)
2. Build backend APIs (Phase 2-3)
3. Implement doctor UI (Phase 4)
4. Implement patient UI (Phase 5)
5. Add bumping system (Phase 6)
6. Test thoroughly (Phase 7-8)
7. Deploy (Phase 9)

Each phase is independent and can be tested before moving to the next!
