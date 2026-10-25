# Student Record Manager (MERN Stack)

A centralized database system to track student enrollments, academic performance, and personal profiles.

- **Admin**: creates, updates, and deletes student records (profile + grades).
- **Student**: logs in and views their own personal record and grades (read-only).

Stack: **M**ongoDB, **E**xpress, **R**eact (Vite), **N**ode.js — with JWT-based auth and role-based access control.

---

## 1. Project Structure

```
student-record-manager/
├── backend/
│   ├── config/db.js
│   ├── models/User.js         # login credentials + role
│   ├── models/Student.js      # academic record: profile, grades
│   ├── middleware/auth.js     # JWT verification + role guard
│   ├── routes/authRoutes.js   # register/login
│   ├── routes/studentRoutes.js# CRUD + self-view
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/ (Login, Register, AdminDashboard, StudentDashboard)
    │   ├── components/ (Navbar, PrivateRoute)
    │   ├── context/AuthContext.jsx
    │   └── api/axios.js
    └── vite.config.js
```

**Data model note:** `User` (login identity) is separate from `Student` (academic record). An admin first creates a `Student` record; the person then registers a login using the *same email* with role `student`, which links their account to that record. This mirrors real systems where an admin/registrar enters students before they get portal access.

---

## 2. Prerequisites (macOS, Apple Silicon M2)

1. **Node.js** (v18+ recommended). Install via [nvm](https://github.com/nvm-sh/nvm) (works natively on M2/arm64):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # restart terminal, then:
   nvm install 20
   nvm use 20
   node -v
   ```

2. **MongoDB** — two options:
   - **Local (native arm64 build)** via Homebrew:
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community@7.0
     brew services start mongodb-community@7.0
     ```
     This runs at `mongodb://127.0.0.1:27017`.
   - **MongoDB Atlas (cloud, no install needed)** — create a free cluster at mongodb.com/atlas and grab the connection string. Easiest option if you don't want a local service running.

3. **Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

---

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_record_manager
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
```
(If using Atlas, replace `MONGO_URI` with your Atlas connection string instead.)

Run it:
```bash
npm run dev
```
You should see `MongoDB connected...` and `Server running on http://localhost:5000`.

---

## 4. Frontend Setup

Open a **new terminal tab**:
```bash
cd frontend
npm install
npm run dev
```
Vite will start at `http://localhost:5173` and proxy `/api` calls to the backend (see `vite.config.js`).

---

## 5. Using the App

1. Go to `http://localhost:5173`.
2. **Register as Admin** first (role = Admin) — this account can manage all records.
3. Log in as admin → **Add Student** to create a student profile (name, roll number, email, department, etc.) and use **+ Grade** to add subject marks.
4. Have the student **Register** using role = Student and the *same email* you used for their record — this links their login to that record.
5. Log in as that student to see their **read-only** profile and grades.

---

## 6. API Reference (quick)

| Method | Endpoint                    | Access        | Purpose                        |
|--------|------------------------------|---------------|---------------------------------|
| POST   | /api/auth/register           | Public        | Create login (admin/student)   |
| POST   | /api/auth/login              | Public        | Get JWT                        |
| GET    | /api/auth/me                 | Logged in     | Current user profile           |
| GET    | /api/students                | Admin         | List/search all records        |
| POST   | /api/students                | Admin         | Create record                  |
| GET    | /api/students/:id            | Admin         | Get one record                 |
| PUT    | /api/students/:id            | Admin         | Update record                  |
| DELETE | /api/students/:id            | Admin         | Delete record                  |
| POST   | /api/students/:id/grades     | Admin         | Add a grade entry              |
| GET    | /api/students/me             | Student       | View own record & grades       |

---

## 7. Next Steps / Ideas to Extend

- Add pagination to the admin student list.
- Add password reset / email verification.
- Export student transcripts as PDF.
- Add attendance tracking as another entity.
- Deploy: backend to Render/Railway, frontend to Vercel/Netlify, DB on Atlas.
