import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = {
  name: "",
  rollNumber: "",
  email: "",
  department: "",
  currentSemester: 1,
  status: "active",
  personalInfo: { phone: "", address: "", guardianName: "" },
};

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [gradeTarget, setGradeTarget] = useState(null); // student being graded
  const [gradeForm, setGradeForm] = useState({ subject: "", marks: "", semester: 1 });

  const loadStudents = async (q = "") => {
    try {
      const { data } = await api.get(`/students${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      setStudents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      rollNumber: s.rollNumber,
      email: s.email,
      department: s.department,
      currentSemester: s.currentSemester,
      status: s.status,
      personalInfo: {
        phone: s.personalInfo?.phone || "",
        address: s.personalInfo?.address || "",
        guardianName: s.personalInfo?.guardianName || "",
      },
    });
    setEditingId(s._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
      } else {
        await api.post("/students", form);
      }
      setShowForm(false);
      loadStudents(search);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student record permanently?")) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents(search);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/students/${gradeTarget._id}/grades`, {
        subject: gradeForm.subject,
        marks: Number(gradeForm.marks),
        semester: Number(gradeForm.semester),
      });
      setGradeTarget(null);
      setGradeForm({ subject: "", marks: "", semester: 1 });
      loadStudents(search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add grade");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="toolbar">
          <input
            placeholder="Search by name, roll no, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadStudents(e.target.value);
            }}
          />
          <button className="btn-add" onClick={openCreate}>+ Add Student</button>
        </div>

        {error && <p className="error">{error}</p>}

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Status</th>
              <th>Grades</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td>{s.department}</td>
                <td>{s.currentSemester}</td>
                <td>{s.status}</td>
                <td>{s.grades.length}</td>
                <td>
                  <button className="btn-sm btn-edit" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn-sm" style={{ background: "#2563eb", color: "white" }} onClick={() => setGradeTarget(s)}>
                    + Grade
                  </button>
                  <button className="btn-sm btn-delete" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={7}>No student records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Student" : "Add Student"}</h3>
            <form onSubmit={handleSave}>
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <label>Roll Number</label>
              <input required value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />

              <label>Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <label>Department</label>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />

              <label>Current Semester</label>
              <input
                type="number" min={1} max={12} required
                value={form.currentSemester}
                onChange={(e) => setForm({ ...form, currentSemester: e.target.value })}
              />

              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>

              <label>Phone</label>
              <input
                value={form.personalInfo.phone}
                onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, phone: e.target.value } })}
              />

              <label>Address</label>
              <input
                value={form.personalInfo.address}
                onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, address: e.target.value } })}
              />

              <label>Guardian Name</label>
              <input
                value={form.personalInfo.guardianName}
                onChange={(e) => setForm({ ...form, personalInfo: { ...form.personalInfo, guardianName: e.target.value } })}
              />

              {error && <p className="error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="primary btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {gradeTarget && (
        <div className="modal-backdrop" onClick={() => setGradeTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Grade — {gradeTarget.name}</h3>
            <form onSubmit={handleAddGrade}>
              <label>Subject</label>
              <input required value={gradeForm.subject} onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })} />

              <label>Marks (0-100)</label>
              <input
                type="number" min={0} max={100} required
                value={gradeForm.marks}
                onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
              />

              <label>Semester</label>
              <input
                type="number" min={1} max={12} required
                value={gradeForm.semester}
                onChange={(e) => setGradeForm({ ...gradeForm, semester: e.target.value })}
              />

              <div className="modal-actions">
                <button type="button" className="primary btn-cancel" onClick={() => setGradeTarget(null)}>Cancel</button>
                <button type="submit" className="primary">Add Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
