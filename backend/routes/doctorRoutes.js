const express = require("express");
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/next", authMiddleware, doctorController.moveToNext);
router.patch("/status", authMiddleware, doctorController.updateStatus);
router.get("/current", authMiddleware, doctorController.getCurrentPatient);
router.get("/profile", authMiddleware, doctorController.getProfile);

module.exports = router;
