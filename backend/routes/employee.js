const express = require("express");

const User = require("../models/User");

const {
    authMiddleware,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Employee gets own profile
router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const user = await User
                .findById(req.user.id)
                .select("-password");

            res.json(user);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Employee edits limited fields
router.put(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                phone,
                address,
                profilePicture
            } = req.body;

            const user = await User.findByIdAndUpdate(
                req.user.id,
                {
                    phone,
                    address,
                    profilePicture
                },
                {
                    new: true
                }
            ).select("-password");

            res.json(user);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Admin gets all employees
router.get(
    "/all",
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const employees = await User
                .find()
                .select("-password");

            res.json(employees);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);


// Admin updates employee
router.put(
    "/:id",
    authMiddleware,
    adminOnly,
    async (req, res) => {

        try {

            const user = await User
                .findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    {
                        new: true
                    }
                )
                .select("-password");

            res.json(user);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;