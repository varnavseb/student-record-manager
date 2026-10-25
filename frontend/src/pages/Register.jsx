import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await register(form);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card auth-card">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label>Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        {form.role === "student" && (
          <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 6 }}>
            Note: a student record with this email must already exist (created by an admin) before you can register.
          </p>
        )}

        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit">Register</button>
      </form>
      <p style={{ marginTop: 14, fontSize: "0.9rem" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
