const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String }, // e.g. A, B, C - auto-calculated below
    semester: { type: Number, required: true },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true },
    currentSemester: { type: Number, required: true, default: 1 },
    enrollmentDate: { type: Date, default: Date.now },
    personalInfo: {
      phone: { type: String },
      address: { type: String },
      dob: { type: Date },
      guardianName: { type: String },
    },
    grades: [gradeSchema],
    status: { type: String, enum: ["active", "graduated", "suspended"], default: "active" },
  },
  { timestamps: true }
);

// Auto-calculate letter grade whenever marks are set
gradeSchema.pre("validate", function (next) {
  if (this.marks >= 90) this.grade = "A+";
  else if (this.marks >= 80) this.grade = "A";
  else if (this.marks >= 70) this.grade = "B";
  else if (this.marks >= 60) this.grade = "C";
  else if (this.marks >= 50) this.grade = "D";
  else this.grade = "F";
  next();
});

module.exports = mongoose.model("Student", studentSchema);
