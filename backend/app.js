const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
 
 app.get("/health", (req, res) => {
   res.json({ status: "UP", timestamp: new Date().toISOString() });
 });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/patient", require("./routes/patient"));
app.use("/api/predict", require("./routes/predict"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));

module.exports = app;
