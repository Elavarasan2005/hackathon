const express = require("express");

const Leave = require("../models/Leave");

const {
    authMiddleware,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// APPLY LEAVE
router.post(
    "/apply",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                leaveType,
                startDate,
                endDate,
                remarks
            } = req.body;

            const leave = await Leave.create({
                employeeId: req.user.id,
                leaveType,
                startDate,
                endDate,
                remarks
            });

            res.status(201).json({
                message: "Leave request submitted",
                leave
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// EMPLOYEE VIEW LEAVES
router.get(
    "/my",
    authMiddleware,
    async (req, res) => {

        try {

            const leaves =
                await Leave.find({
                    employeeId: req.user.id
                }).sort({
                    createdAt: -1
                });

            res.json(leaves);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// ADMIN VIEW ALL LEAVES
router.get(
    "/all",
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const leaves =
                await Leave.find()
                    .populate(
                        "employeeId",
                        "name employeeId email"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json(leaves);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// APPROVE / REJECT
router.put(
    "/:id",
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const {
                status,
                adminComment
            } = req.body;

            const leave =
                await Leave.findByIdAndUpdate(
                    req.params.id,
                    {
                        status,
                        adminComment
                    },
                    {
                        new: true
                    }
                );

            res.json({
                message: "Leave updated",
                leave
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;