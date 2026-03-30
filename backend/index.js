const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

// Load ENV
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/patient", require("./routes/patient"));
app.use("/api/predict", require("./routes/predict"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
