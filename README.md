# 🏥 SehatSetu — AI-Powered Healthcare Connect

A comprehensive healthcare platform that connects patients with doctors and provides AI-driven preliminary diagnosis and specialist recommendations. Patients describe their symptoms in natural language, receive potential disease predictions, and are instantly matched with the most relevant medical specialists.


Problem Statement

Patients often struggle to understand their symptoms or identify the right specialist, leading to delayed treatments or incorrect consultations. SehatSetu provides an intelligent first point of contact for preliminary diagnosis and streamlined doctor-patient interaction, ensuring patients receive the right care without unnecessary delays.

Features

AI Symptom Extraction — Natural language processing (NLP) to extract clinical symptoms from user-provided descriptions.
Disease Prediction — Machine learning models that predict potential health conditions based on the extracted symptoms.
Specialist Recommendation — Intelligent routing that matches predicted conditions to the top 3 most relevant specialist types.
Doctor Dashboard — Real-time management interface for healthcare providers to track appointments and patient records.
Appointment Booking — Integrated scheduling system for seamless interaction between patients and doctors.
Virtual Waiting Room — Live tracking of appointment status and queue position for waiting patients.
Patient Records — Secure storage and retrieval of medical history and consultation notes.
Secure Auth — Robust JWT-based authentication for both patient and doctor portals.
Responsive UI — Modern, mobile-first design built with Tailwind CSS for a premium user experience.

Tech Stack

Layer	Technology
Frontend	Next.js 16 (App Router), Tailwind CSS 4, React 19
Backend	Node.js, Express.js
ML Service	FastAPI, Python 3.10+, Spacy, Scikit-learn
Database	MongoDB + Mongoose
AI	Natural Language Processing (NLP) + Random Forest Classifier
Communication	REST API + Server-Sent Events (SSE)

Project Structure

SehatSetu/
├── frontend/                     # Next.js Frontend Application
│   ├── src/app/
│   │   ├── (auth)/               # Login & Registration
│   │   ├── (patient)/            # Patient Dashboard & Symptoms
│   │   ├── (doctor)/             # Doctor Workspace & Appointments
│   │   └── waiting-room/         # Real-time queue status
│   ├── components/               # Reusable UI components
│   └── store/                    # Frontend state management
│
├── backend/                      # Express.js Backend API
│   ├── controllers/              # Business logic & Handlers
│   ├── models/                   # MongoDB Mongoose schemas
│   ├── routes/                   # API Endpoint definitions
│   ├── middleware/               # Auth & Error handling
│   ├── services/                 # Third-party integrations
│   ├── package.json
│   └── .env.example
│
├── python_service/               # AI/ML Microservice (FastAPI)
│   ├── models/                   # Pre-trained ML models (.pkl)
│   ├── app.py                    # FastAPI routes
│   ├── symptom_extractor.py      # NLP logic for extraction
│   └── requirements.txt          # Python dependencies
│
└── ai-model/                     # Model training & Datasets

Database Schema (Mongoose)

The core data models are defined in the `backend/models` directory:

User — Core authentication and role management.
- `email` (String, unique, required)
- `password` (String, hashed)
- `role` (String: PATIENT/DOCTOR)

Doctor — Professional profiles and availability tracking.
- `userId` (ObjectId, ref: User)
- `fullName` (String)
- `department` (String: Cardiology, Neurology, Orthopedics, etc.)
- `status` (String: attending, on_break, emergency, offline)
- `shiftStart/End` (String, default: 09:00-17:00)
- `averageConsultationTime` (Number, default: 15 mins)
- `isJuniorDoctor` (Boolean)

Patient — Comprehensive medical intake and diagnosis tracking.
- `userId` (ObjectId, ref: User)
- `fullName`, `dob`, `gender`, `contact`, `email`
- `symptoms` (Raw input)
- `extractedSymptoms` (Array of clinical terms)
- `predictedDisease` (String)
- `topPredictions` (Array: disease, confidence, specialist)
- `appointmentStatus` (Pending, Scheduled, Completed, Cancelled)
- `queuePosition` (Number)
- `queueStatus` (waiting, attending, completed, bumped)

Getting Started

Prerequisites

Node.js 18+
Python 3.9+
MongoDB (Local or Atlas)

1. Clone the Repository

git clone https://github.com/AananditKanwar/SehatSetu.git
cd SehatSetu

2. Environment Variables

Create .env files in both backend/ and frontend/ directories:

backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sehatsetu
JWT_SECRET=your_jwt_secret
PYTHON_SERVICE_URL=http://localhost:8000

frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

3. Install Dependencies

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Python Service
cd ../python_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

4. Run Development Servers

# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — AI Service
cd python_service && source venv/bin/activate && uvicorn app:app --reload --port 8000

API Endpoints

Auth

Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Authenticate user & return JWT
GET	/api/auth/me	Get current user profile

Healthcare (Protected)

Method	Endpoint	Description
POST	/api/ai/predict	Extract symptoms & predict disease
GET	/api/doctors	List available doctors by specialty
POST	/api/appointments	Book a new consultation
GET	/api/appointments/me	Get user-specific appointments
PATCH	/api/appointments/:id	Update appointment status (Doctor)

User Flow

1. Landing Page
   └──▶ 2. Login/Signup
         └──▶ 3. Describe Symptoms (Natural Language)
               └──▶ 4. AI Analysis
                     ├── Symptom Extraction
                     └── Disease Prediction
                           └──▶ 5. Specialist Recommendation
                                 └──▶ 6. Book Appointment
                                       └──▶ 7. Wait in Virtual Room (Real-time)
                                             └──▶ 8. Doctor Consultation

AI Features (Python + Spacy)

Symptom Extraction

Uses Spacy's NLP pipeline to identify clinical symptoms from unstructured user text. It filters out noise and maps colloquial terms to clinical entities.

Disease Prediction

A Random Forest Classifier trained on medical datasets predicts potential diseases based on the presence/absence of extracted symptoms.

Specialist Routing

A weighted mapping system that recommends specific medical fields (e.g., Cardiology, Dermatology) based on the severity and type of predicted conditions.

Key Dependencies

Frontend

next, react, react-dom
tailwindcss, lucide-react
axios, zustand
framer-motion

Backend

express, mongoose
jsonwebtoken, bcryptjs
cors, dotenv
winston (logging)

Python Service

fastapi, uvicorn
spacy, scikit-learn
pandas, numpy
pydantic

Security

JWT-based authentication for all protected routes
Bcrypt password hashing (10 salt rounds)
Input sanitization for symptoms and user profiles
CORS restricted to authorized frontend domains
Rate limiting on AI prediction endpoints

Scripts

# Backend
npm run dev          # Start server with nodemon
npm start            # Production start

# Frontend
npm run dev          # Next.js dev server
npm run build        # Production build

# AI Service
uvicorn app:app      # Run FastAPI server

Contributing

Fork the repo
Create a feature branch (git checkout -b feature/new-ai-model)
Commit changes (git commit -m 'Improve symptom extraction')
Push to branch (git push origin feature/new-ai-model)
Open a Pull Request

License

This project is built for internal university use. All rights reserved.

Team

Built by Aanandit and Aryan
