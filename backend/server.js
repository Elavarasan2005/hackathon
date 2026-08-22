const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes =
    require("./routes/auth");

const employeeRoutes =
    require("./routes/employee");

const attendanceRoutes =
    require("./routes/attendance");

const leaveRoutes =
    require("./routes/leave");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Dayflow HRMS API is running"
    });
});


// MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected");

        app.listen(
            process.env.PORT,
            () => {
                console.log(
                    `Server running on port ${process.env.PORT}`
                );
            }
        );

    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error
        );
    });