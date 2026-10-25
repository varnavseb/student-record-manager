const express = require("express");
const Student = require("../models/Student");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/students/me
// @desc    Logged-in student views their own record & grades
// @access  Private (student)
router.get("/me", protect, authorize("student"), async (req, res) => {
  if (!req.user.student) {
    return res.status(404).json({ message: "No student record linked to this account" });
  }
  const student = await Student.findById(req.user.student);
  res.json(student);
});

// @route   GET /api/students
// @desc    Admin: list all student records (supports ?search=&department=)
// @access  Private (admin)
router.get("/", protect, authorize("admin"), async (req, res) => {
  const { search, department } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (department) filter.department = department;

  const students = await Student.find(filter).sort({ createdAt: -1 });
  res.json(students);
});

// @route   GET /api/students/:id
// @desc    Admin: get a single student record
// @access  Private (admin)
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
});

// @route   POST /api/students
// @desc    Admin: create a new student record
// @access  Private (admin)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Admin: update a student record (profile, department, grades, etc.)
// @access  Private (admin)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   POST /api/students/:id/grades
// @desc    Admin: add/append a grade entry for a student
// @access  Private (admin)
router.post("/:id/grades", protect, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.grades.push(req.body); // { subject, marks, semester }
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Admin: delete a student record
// @access  Private (admin)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Student record deleted successfully" });
});

module.exports = router;
