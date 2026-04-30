const express = require("express");
const queueController = require("../controllers/queueController");
const sseController = require("../controllers/sseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/join", authMiddleware, queueController.joinQueue);
router.get("/status/:patientId", authMiddleware, queueController.getQueueStatus);
router.delete("/leave/:patientId", authMiddleware, queueController.leaveQueue);
router.get("/stream/:patientId", sseController.streamQueueUpdates);
router.get(
  "/department/:department",
  authMiddleware,
  queueController.getDepartmentQueue
);

module.exports = router;
