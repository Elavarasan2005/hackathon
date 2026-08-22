const express = require("express");

const Attendance = require("../models/Attendance");

const {
    authMiddleware,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// CHECK IN
router.post(
    "/checkin",
    authMiddleware,
    async (req, res) => {

        try {

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const existing =
                await Attendance.findOne({
                    employeeId: req.user.id,
                    date: {
                        $gte: startOfDay
                    }
                });

            if (existing) {
                return res.status(400).json({
                    message: "Already checked in"
                });
            }

            const attendance =
                await Attendance.create({
                    employeeId: req.user.id,
                    date: new Date(),
                    checkIn: new Date(),
                    status: "Present"
                });

            res.json({
                message: "Check-in successful",
                attendance
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// CHECK OUT
router.put(
    "/checkout",
    authMiddleware,
    async (req, res) => {

        try {

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const attendance =
                await Attendance.findOne({
                    employeeId: req.user.id,
                    date: {
                        $gte: startOfDay
                    }
                });

            if (!attendance) {
                return res.status(404).json({
                    message: "Check in first"
                });
            }

            attendance.checkOut = new Date();

            await attendance.save();

            res.json({
                message: "Check-out successful",
                attendance
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Employee sees own attendance
router.get(
    "/my",
    authMiddleware,
    async (req, res) => {

        try {

            const records =
                await Attendance.find({
                    employeeId: req.user.id
                }).sort({
                    date: -1
                });

            res.json(records);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Admin sees all attendance
router.get(
    "/all",
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const records =
                await Attendance
                    .find()
                    .populate(
                        "employeeId",
                        "name employeeId"
                    )
                    .sort({
                        date: -1
                    });

            res.json(records);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;