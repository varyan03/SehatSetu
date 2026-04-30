const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const app = require("./app");

// Load ENV
dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
