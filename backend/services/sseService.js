class SSEService {
  constructor() {
    this.connections = new Map();
    this.departmentSubscriptions = new Map();
  }

  addConnection(patientId, department, res, req) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    this.sendEvent(res, "connected", {
      message: "Connected to queue updates",
      timestamp: new Date().toISOString(),
    });

    this.connections.set(patientId, res);

    if (!this.departmentSubscriptions.has(department)) {
      this.departmentSubscriptions.set(department, new Set());
    }
    this.departmentSubscriptions.get(department).add(patientId);

    console.log(`SSE: Patient ${patientId} connected to ${department}`);

    req.on("close", () => {
      this.removeConnection(patientId, department);
    });
  }

  removeConnection(patientId, department) {
    this.connections.delete(patientId);

    if (this.departmentSubscriptions.has(department)) {
      this.departmentSubscriptions.get(department).delete(patientId);

      if (this.departmentSubscriptions.get(department).size === 0) {
        this.departmentSubscriptions.delete(department);
      }
    }

    console.log(`SSE: Patient ${patientId} disconnected from ${department}`);
  }

  sendEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  async broadcastQueueUpdate(department) {
    const queueService = require("./queueService");

    if (!this.departmentSubscriptions.has(department)) {
      return;
    }

    const patientIds = Array.from(this.departmentSubscriptions.get(department));

    for (const patientId of patientIds) {
      const res = this.connections.get(patientId);
      if (!res) continue;

      try {
        const queueInfo = await queueService.getPatientQueueInfo(patientId);
        if (queueInfo) {
          this.sendEvent(res, "queue_update", queueInfo);
        }
      } catch (error) {
        console.error(`SSE: Error sending update to patient ${patientId}:`, error);
      }
    }

    console.log(
      `SSE: Broadcasted queue update to ${patientIds.length} patients in ${department}`
    );
  }

  broadcastDoctorStatusChange(department, statusData) {
    if (!this.departmentSubscriptions.has(department)) {
      return;
    }

    const patientIds = Array.from(this.departmentSubscriptions.get(department));

    for (const patientId of patientIds) {
      const res = this.connections.get(patientId);
      if (!res) continue;

      this.sendEvent(res, "doctor_status", statusData);
    }

    console.log(
      `SSE: Broadcasted doctor status to ${patientIds.length} patients in ${department}`
    );
  }

  notifyPatient(patientId, event, data) {
    const res = this.connections.get(patientId);
    if (!res) {
      console.log(`SSE: Patient ${patientId} not connected, cannot notify`);
      return false;
    }

    this.sendEvent(res, event, data);
    return true;
  }

  getConnectionCount(department = null) {
    if (department) {
      return this.departmentSubscriptions.get(department)?.size || 0;
    }
    return this.connections.size;
  }
}

module.exports = { sseService: new SSEService() };
