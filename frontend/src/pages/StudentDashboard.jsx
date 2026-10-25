import { useEffect, useState } from "react";
import api from "../api/axios";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/students/me")
      .then((res) => setStudent(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load your record"));
  }, []);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!student) return <div className="container"><p>Loading your record...</p></div>;

  const avg =
    student.grades.length > 0
      ? (student.grades.reduce((sum, g) => sum + g.marks, 0) / student.grades.length).toFixed(1)
      : "—";

  return (
    <div className="container">
      <div className="card">
        <h2>My Profile</h2>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Roll Number:</strong> {student.rollNumber}</p>
        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Department:</strong> {student.department}</p>
        <p><strong>Current Semester:</strong> {student.currentSemester}</p>
        <p><strong>Status:</strong> {student.status}</p>
        <p><strong>Enrolled:</strong> {new Date(student.enrollmentDate).toLocaleDateString()}</p>
        {student.personalInfo && (
          <>
            <h4>Personal Info</h4>
            <p><strong>Phone:</strong> {student.personalInfo.phone || "—"}</p>
            <p><strong>Address:</strong> {student.personalInfo.address || "—"}</p>
            <p><strong>Guardian:</strong> {student.personalInfo.guardianName || "—"}</p>
          </>
        )}
      </div>

      <div className="card">
        <div className="toolbar">
          <h2>My Grades</h2>
          <span>Average: <strong>{avg}</strong></span>
        </div>
        {student.grades.length === 0 ? (
          <p>No grades recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {student.grades.map((g, i) => (
                <tr key={i}>
                  <td>{g.subject}</td>
                  <td>{g.semester}</td>
                  <td>{g.marks}</td>
                  <td><span className="grade-badge">{g.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
