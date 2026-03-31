# SehatSetu

SehatSetu is a comprehensive healthcare platform that connects patients with doctors and provides AI-driven preliminary diagnosis and specialist recommendations.

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend (API)**: Next.js API Routes
- **ML Service**: Python (FastAPI, scikit-learn, spacy)
- **Database**: MongoDB

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- MongoDB running locally or a connection string

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AananditKanwar/SehatSetu.git
cd SehatSetu
```

### 2. Frontend Setup

Install the Node.js dependencies:

```bash
cd sehatsetu
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### 3. Python Service Setup (ML Engine)

The Python service handles symptom extraction and disease prediction.

Open a new terminal and navigate to the `python_service` directory:

```bash
cd python_service
```

Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

**Note:** The machine learning models (`disease_model.pkl`, `disease_encoder.pkl`, `symptoms_list.pkl`) must be present in `sehatsetu/python_service/models/`. You can download them from here: **[Download Models (Google Drive Link)](https://drive.google.com/drive/folders/1Tm0pVEnAdh50hFiwAHWcg9OlSa9CpRFn?usp=sharing)**.

Start the Python service using the convenience script (handles virtual environment activation automatically):

```bash
npm run python-service
```
    
Alternatively, you can run it manually:

```bash
cd python_service
source venv/bin/activate
uvicorn app:app --reload --port 8000
```

The service will be available at [http://localhost:8000](http://localhost:8000).

### 4. Running the Full Application

1.  Ensure MongoDB is running.
2.  Start the **Python Service** (Terminal 1).
3.  Start the **Next.js Frontend** (Terminal 2).
4.  Open your browser and navigate to `http://localhost:3000`.

## Features

- **Patient Intake Form**: Users can describe their symptoms in natural language.
- **AI Symptom Extraction**: Uses NLP to extract clinical symptoms from text.
- **Disease Prediction**: Predicts potential conditions based on symptoms.
- **Specialist Recommendation**: Recommends the top 3 specialist types (e.g., Cardiologist, Dermatologist) for the predicted conditions.
