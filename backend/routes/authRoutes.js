const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @route   POST /api/auth/register
// @desc    Register a new user (admin or student)
// @access  Public
// NOTE: In production you'd want to lock down admin registration (e.g. an
// invite code) so random users can't self-register as admin.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    let linkedStudent = null;

    // A student account must correspond to a student record already
    // created by an admin (matched by email).
    if (role === "student") {
      linkedStudent = await Student.findOne({ email: email.toLowerCase() });
      if (!linkedStudent) {
        return res.status(400).json({
          message: "No student record found for this email. Ask the admin to create your record first.",
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === "admin" ? "admin" : "student",
      student: linkedStudent ? linkedStudent._id : null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      student: user.student,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get the logged-in user's own profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("student");
  res.json(user);
});

module.exports = router;
