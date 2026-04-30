# SehatSetu - Technical Documentation

SehatSetu is a modern healthcare platform designed to bridge the gap between patients and medical professionals using AI-driven symptom analysis and specialist recommendations.

---

## 🏗️ High-Level Architecture

The project follows a **decoupled micro-service architecture** consisting of three main components:

1.  **Frontend**: A Next.js (React) application providing a responsive and interactive user interface.
2.  **Backend (API)**: An Express.js server that manages business logic, user authentication, and database interactions.
3.  **ML Service**: A Python (FastAPI) service dedicated to Natural Language Processing (NLP) for symptom extraction and disease prediction.
4.  **Database**: MongoDB (via Mongoose) for persistent data storage.

---

## 📂 Project Structure

```text
SehatSetu/
├── backend/                # Express.js Backend
│   ├── config/             # DB and other configurations
│   ├── models/             # Mongoose Schemas (User, Patient)
│   ├── routes/             # API Route Handlers
│   ├── .env                # Backend Environment Variables
│   └── index.js            # Entry point
├── frontend/               # Next.js Frontend
│   ├── public/             # Static assets
│   ├── src/                # Frontend Source
│   │   ├── app/            # Next.js App Router (Pages & Layouts)
│   │   └── ...
│   └── package.json
├── ai-model/               # Machine Learning Research & Models
│   └── ...
└── README.md               # Quick start guide
```

---

## 🖥️ Backend Documentation

The backend serves as the central hub, coordinating between the frontend, the database, and the ML prediction service.

### Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT (jsonwebtoken), bcryptjs
- **Cross-Origin**: CORS enabled

### API Endpoints

#### 1. Authentication (`/api/auth`)
Handles user identity management.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Registers a new user with hashed password. | No |
| `POST` | `/login` | Authenticates user and returns a JWT token. | No |

#### 2. Patient Management (`/api/patient`)
Manages patient clinical records and intake forms.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submits a new patient intake form. | Yes (JWT) |
| `GET` | `/` | Fetches patient records (linked to the user). | Yes (JWT) |

#### 3. AI Prediction (`/api/predict`)
Proxy to the Python ML service.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Forwards symptoms to Python service for disease prediction. | No (Optional) |

---

## 🗄️ Database Models

### User Model
- `email`: String (Unique, Required)
- `password`: String (Hashed)
- `role`: String (Default: "PATIENT")

### Patient Model
- `userId`: ObjectId (Ref: User)
- `fullName`: String (Required)
- `dob`: Date
- `gender`: String
- `contact`: String
- `email`: String (Linked to User)
- `symptoms`: String
- `department`: String

---

## 🤖 Machine Learning Service (Python)

Located in a separate service (referenced as `ai-model` or `python_service`), it uses:
- **FastAPI**: For high-performance API endpoints.
- **spaCy**: For extracting medical symptoms from natural language text.
- **scikit-learn**: For disease prediction models.

**Key Endpoint**: `POST /predict`
- **Input**: Symptoms list or raw text.
- **Output**: Predicted disease and recommended specialist department.

---

## 🌐 Frontend Documentation

Built with **Next.js**, focusing on modern UX.

### Key Pages
- `/`: Landing page with feature overview.
- `/login` / `/register`: Authentication portals.
- `/dashboard`: User-specific overview and quick actions.
- `/patient-form`: Intake form for symptom analysis.

---

## 🔐 Security Implementation
1.  **Password Hashing**: Done using `bcryptjs` before saving to MongoDB.
2.  **Stateless Auth**: JWT tokens generated upon login.
3.  **Middleware**: Backend routes verify JWTs in the `Authorization` header.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
MONGODB_URI=mongodb://...
JWT_SECRET=your_jwt_secret
PYTHON_SERVICE_URL=http://localhost:8000
```
