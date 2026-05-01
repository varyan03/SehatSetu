# 🏥 SehatSetu — AI-Powered Healthcare Connect

A comprehensive healthcare platform that connects patients with doctors and provides AI-driven preliminary diagnosis and specialist recommendations. Patients describe their symptoms in natural language, receive potential disease predictions, and are instantly matched with the most relevant medical specialists.

Status: Active. Full healthcare ecosystem with AI-powered diagnosis, real-time doctor dashboards, and virtual waiting room.

## Problem Statement

Patients often struggle to understand their symptoms or identify the right specialist, leading to delayed treatments or incorrect consultations. SehatSetu provides an intelligent first point of contact for preliminary diagnosis and streamlined doctor-patient interaction, ensuring patients receive the right care without unnecessary delays.

## Features

**AI Symptom Extraction** — Natural language processing (NLP) to extract clinical symptoms from user-provided descriptions.

**Disease Prediction** — Machine learning models that predict potential health conditions based on extracted symptoms.

**Specialist Recommendation** — Intelligent routing that matches predicted conditions to the top 3 most relevant specialist types.

**Doctor Dashboard** — Real-time management interface for healthcare providers to track appointments and patient records with status updates.

**Appointment Booking** — Integrated scheduling system for seamless interaction between patients and doctors with confirmed time slots.

**Virtual Waiting Room** — Live tracking of appointment status and queue position for waiting patients with real-time SSE updates.

**Patient Records** — Secure storage and retrieval of medical history, consultation notes, and symptom records.

**Queue Management** — Real-time queue tracking with automatic position updates and appointment prioritization.

**Secure Auth** — Robust JWT-based authentication with refresh tokens for both patient and doctor portals.

**Responsive UI** — Modern, mobile-first design built with Tailwind CSS for a premium user experience across all devices.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14+ (App Router), Tailwind CSS 4, React 19, Zustand |
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **ML Service** | FastAPI, Python 3.10+, Spacy, Scikit-learn |
| **Database** | MongoDB + Mongoose (primary) |
| **AI** | Natural Language Processing (NLP) + Random Forest Classifier, Symptom Extraction |
| **Communication** | REST API + Server-Sent Events (SSE) for real-time updates |
| **Authentication** | JWT with Refresh Tokens, Bcrypt |

## Project Structure

```
SehatSetu/
├── frontend/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Patient & Doctor Login
│   │   │   ├── register/         # User Registration
│   │   │   ├── patient-form/     # Symptom Input & Prediction
│   │   │   ├── dashboard/        # Patient Dashboard
│   │   │   ├── doctor/
│   │   │   │   └── dashboard/    # Doctor Workspace & Appointments
│   │   │   ├── appointments/     # Appointment Booking & History
│   │   │   ├── waiting-room/     # Real-time Queue Status (SSE)
│   │   │   └── globals.css       # Global Tailwind Styles
│   │   └── components/           # Reusable UI components
│   ├── public/                   # Static assets
│   ├── package.json
│   └── next.config.mjs
│
├── backend/                      # Express.js Backend API 
│   ├── controllers/              # Business logic & Request handlers
│   │   ├── doctorController.js
│   │   ├── queueController.js
│   │   └── sseController.js
│   ├── models/                   # MongoDB Mongoose schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Patient.js
│   ├── routes/                   # API Endpoint definitions
│   │   ├── auth.js
│   │   ├── doctorRoutes.js
│   │   ├── patient.js
│   │   ├── queueRoutes.js
│   │   └── predict.js
│   ├── middleware/               # Auth, validation & Error handling
│   │   └── authMiddleware.js
│   ├── services/                 # Business logic & integrations
│   │   ├── queueService.js       # Queue management
│   │   └── sseService.js         # Server-Sent Events
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── utils/
│   │   └── department.js         # Specialty mappings
│   ├── tests/
│   │   └── queue.integration.test.js
│   ├── app.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── python_service/               # AI/ML Microservice (FastAPI)
│   ├── models/                   # Pre-trained ML models (.pkl)
│   ├── app.py                    # FastAPI routes & endpoints
│   ├── symptom_extractor.py      # NLP logic for symptom extraction
│   ├── generate_mapping.py       # Specialist mapping generation
│   ├── list_diseases.py          # Disease dataset utilities
│   ├── specialist_mapping.json   # Doctor-disease mapping
│   └── requirements.txt          # Python dependencies
│
├── ai-model/                     # Model training & Datasets
│   └── (Training scripts & datasets)
│
├── scratch/                      # Development & debugging scripts
├── docker-compose.yml            # Container orchestration
├── .env.example
└── README.md
```

## Database Schema (Mongoose)

The core data models are defined in the `backend/models` directory:

### User
Central authentication and role management.
- `email` (String, unique, required) — User's email address
- `password` (String, hashed) — Bcrypt hashed password
- `role` (String: PATIENT/DOCTOR) — User type
- `createdAt` / `updatedAt` (Date) — Timestamps

### Doctor
Professional profiles and availability tracking.
- `userId` (ObjectId, ref: User) — Reference to user account
- `fullName` (String) — Doctor's full name
- `specialization` (String) — Medical specialty (Cardiology, Neurology, Orthopedics, Dermatology, etc.)
- `department` (String) — Department assignment
- `status` (String: attending, on_break, emergency, offline) — Current availability status
- `shiftStart` / `shiftEnd` (String, default: 09:00-17:00) — Working hours
- `averageConsultationTime` (Number, default: 15) — Expected consultation duration in minutes
- `isJuniorDoctor` (Boolean) — Experience level indicator
- `totalAppointments` (Number) — Lifetime appointment count
- `rating` (Number, default: 4.5) — Patient satisfaction rating

### Patient
Comprehensive medical intake and diagnosis tracking.
- `userId` (ObjectId, ref: User) — Reference to user account
- `fullName` (String) — Patient's full name
- `dob` (Date) — Date of birth
- `gender` (String) — Gender (M/F/Other)
- `contact` (String) — Phone number
- `email` (String) — Email address
- `symptoms` (String) — Raw, unprocessed symptom description
- `extractedSymptoms` (Array) — Clinical terms extracted via NLP
- `predictedDisease` (String) — Primary disease prediction from ML model
- `topPredictions` (Array) — Top 3 predictions with confidence scores and recommended specialists
- `appointmentStatus` (String: Pending, Scheduled, Completed, Cancelled)
- `queuePosition` (Number) — Current position in appointment queue
- `queueStatus` (String: waiting, attending, completed, bumped) — Real-time queue state
- `medicalHistory` (Array) — Previous consultations and diagnoses

## Getting Started

### Prerequisites

- **Node.js** 18+ (with npm/yarn)
- **Python** 3.9+ (for ML service)
- **MongoDB** (Local or Atlas cloud database)
- **Redis** (Optional, for session caching)
- **Git** (For version control)

### 1. Clone the Repository

```bash
git clone https://github.com/AananditKanwar/SehatSetu.git
cd SehatSetu
```

### 2. Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**backend/.env**

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sehatsetu

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Python AI Service
PYTHON_SERVICE_URL=http://localhost:8000

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Email (Optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=SehatSetu
```

### 3. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Python Service
cd ../python_service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (runs on port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (runs on port 3000)
cd frontend && npm run dev

# Terminal 3 — Python AI Service (runs on port 8000)
cd python_service
source venv/bin/activate
python -m uvicorn app:app --reload --port 8000
```

Frontend runs on **http://localhost:3000**, Backend on **http://localhost:5000**, Python Service on **http://localhost:8000**.

### 5. Run with Docker (Optional)

```bash
docker-compose up --build
```

This starts the frontend, backend, MongoDB, and Python service containers together.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user (patient or doctor) |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `POST` | `/api/auth/refresh` | Refresh access token using refresh token |
| `POST` | `/api/auth/logout` | Invalidate current session |
| `GET` | `/api/auth/me` | Get current authenticated user profile |

### Healthcare & Diagnosis (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/predict` | Extract symptoms & predict disease |
| `GET` | `/api/doctors` | List available doctors by specialty |
| `GET` | `/api/doctors/:id` | Get specific doctor profile & availability |
| `POST` | `/api/appointments` | Book a new consultation |
| `GET` | `/api/appointments/me` | Get user-specific appointments |
| `PATCH` | `/api/appointments/:id` | Update appointment status (Doctor only) |
| `GET` | `/api/queue/:appointmentId` | Get real-time queue position (SSE stream) |
| `GET` | `/api/patient/:id` | Retrieve patient medical records |
| `POST` | `/api/patient/:id/history` | Save consultation notes to medical history |

### Doctor Dashboard (Protected, Doctor Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctor/dashboard` | Get doctor's appointment queue for today |
| `PATCH` | `/api/doctor/status` | Update doctor's availability status |
| `GET` | `/api/doctor/appointments` | Get all doctor's appointments (with filters) |
| `POST` | `/api/doctor/complete/:appointmentId` | Mark appointment as completed |

## User Flow

### Patient Journey
```
1. Landing Page
   └──▶ 2. Login/Signup
         └──▶ 3. Patient Dashboard
               └──▶ 4. Describe Symptoms (Natural Language)
                     └──▶ 5. AI Analysis
                           ├── Symptom Extraction (Spacy NLP)
                           └── Disease Prediction (Random Forest)
                                 └──▶ 6. View Results & Specialist Recommendations
                                       └──▶ 7. Book Appointment with Recommended Doctor
                                             └──▶ 8. Join Virtual Waiting Room (Real-time SSE)
                                                   └──▶ 9. Doctor Consultation
                                                         └──▶ 10. Download/Save Consultation Notes
```

### Doctor Journey
```
1. Login with Doctor Account
   └──▶ 2. Doctor Dashboard (Real-time Queue View)
         └──▶ 3. Update Availability Status
               └──▶ 4. View Upcoming Appointments
                     └──▶ 5. Review Patient Symptoms & Predictions
                           └──▶ 6. Attend to Patient in Waiting Room
                                 └──▶ 7. Document Consultation
                                       └──▶ 8. Mark Appointment Complete
```

## AI Features (Python + Spacy + Scikit-learn)

### Symptom Extraction

Uses **Spacy's NLP pipeline** to identify clinical symptoms from unstructured user text. The system:
- Filters out noise and irrelevant information
- Maps colloquial/informal terms to clinical entities (e.g., "headache" → "cephalgia")
- Extracts multiple symptoms from complex descriptions
- Returns confidence scores for each extracted symptom

### Disease Prediction

A **Random Forest Classifier** trained on comprehensive medical datasets that:
- Predicts potential diseases based on the presence/absence of extracted symptoms
- Returns top 3 predictions with confidence scores
- Includes risk severity classification (Low/Medium/High)
- Continuously improved with verified medical data

### Specialist Routing

A **weighted mapping system** that recommends specific medical fields based on:
- Predicted disease severity and type
- Doctor availability and specialization match
- Patient location and preferences
- Specialist expertise level (Junior/Senior doctor recommendation)

## Key Dependencies

### Frontend
- **next**, **react**, **react-dom** — Framework & rendering
- **tailwindcss**, **lucide-react** — Styling & icons
- **axios** — HTTP client for API calls
- **zustand** — Lightweight state management
- **framer-motion** — Animation library for smooth UI transitions

### Backend
- **express** — Web framework
- **mongoose** — MongoDB ORM & schema validation
- **jsonwebtoken** — JWT token generation & verification
- **bcryptjs** — Password hashing (10 salt rounds)
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — Environment variable management
- **winston** — Structured logging
- **express-validator** — Request validation

### Python Service
- **fastapi**, **uvicorn** — Async web framework & server
- **spacy** — NLP for symptom extraction
- **scikit-learn** — Machine learning models
- **pandas**, **numpy** — Data manipulation & numerical computing
- **pydantic** — Data validation using Python type hints

## Security

✅ **JWT-based Authentication** — All protected routes require valid JWT tokens with 15-min access token and 7-day refresh token.

✅ **Password Security** — Bcrypt hashing with 10 salt rounds ensures passwords are never stored in plain text.

✅ **Input Sanitization** — All user inputs are validated and sanitized to prevent XSS and SQL injection attacks.

✅ **CORS Protection** — CORS restricted to authorized frontend domain only.

✅ **Rate Limiting** — Endpoint-level rate limiting to prevent brute-force attacks and abuse.

✅ **Medical Data Privacy** — Encrypted storage of sensitive patient information with audit logs for data access.

✅ **Error Handling** — Generic error messages to prevent information leakage about system internals.

## Scripts

### Backend

```bash
npm run dev          # Start dev server with auto-reload (nodemon)
npm start            # Production start
npm test             # Run integration tests (Jest)
npm run lint         # Check code with ESLint
```

### Frontend

```bash
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint checks
```

### Python Service

```bash
uvicorn app:app --reload --port 8000        # Start dev server with auto-reload
python -m pytest tests/                      # Run tests (if configured)
```

### Database

```bash
# MongoDB shell access (if running locally)
mongosh mongodb://localhost:27017/sehatsetu

# Seed initial data (optional)
node backend/scripts/seed_doctor.js
```

## Contributing

We welcome contributions from developers, designers, and healthcare professionals!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/ai-improvement`)
3. **Commit** your changes (`git commit -m 'Add improved symptom extraction'`)
4. **Push** to your branch (`git push origin feature/ai-improvement`)
5. **Open** a Pull Request with detailed description

### Development Guidelines

- Follow the existing code style
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Keep PRs focused and reasonably sized

## License

This project is built for internal university use. All rights reserved.

## Team

Built by **Aanandit Kanwar** and **Aryan** for healthcare connectivity and accessible diagnosis.

---

## Troubleshooting

### Python Service Not Connecting

Ensure the Python service is running on port 8000:
```bash
cd python_service && source venv/bin/activate && python -m uvicorn app:app --reload --port 8000
```

### MongoDB Connection Error

Verify MongoDB is running:
```bash
# For local MongoDB
mongosh

# For MongoDB Atlas, verify CONNECTION_STRING in .env
```

### Port Already in Use

Kill the process using the port:
```bash
# macOS/Linux
lsof -i :5000        # Find process on port 5000
kill -9 <PID>        # Kill the process

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL (default: `http://localhost:3000`)

## Additional Resources

- **AI Model Documentation** — See `/ai-model/` for training scripts
- **API Documentation** — Full OpenAPI docs available at `http://localhost:5000/docs` (if Swagger enabled)
- **Database Schema** — Mongoose models in `backend/models/`
- **Patient Diagnosis Logic** — `python_service/symptom_extractor.py` and model files

---

**Made with ❤️ for better healthcare accessibility**
