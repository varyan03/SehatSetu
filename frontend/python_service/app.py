from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import joblib
import numpy as np
from thefuzz import process
import uvicorn
import os
from typing import List, Optional
import sys

# Add current directory to path so we can import symptom_extractor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from symptom_extractor import extract_symptoms

app = FastAPI()

# Global variables for models
model = None
encoder = None
symptoms_list = None
specialist_mapping = None

def load_models():
    global model, encoder, symptoms_list, specialist_mapping
    try:
        print("Loading models...")
        model_path = os.path.join(os.path.dirname(__file__), "models")
        
        print(f"Loading disease_model from {model_path}...")
        # Use mmap_mode='r' to prevent loading entire model into RAM at once
        model = joblib.load(os.path.join(model_path, 'disease_model.pkl'), mmap_mode='r')
        print(" disease_model loaded.")
        
        print("Loading disease_encoder...")
        encoder = joblib.load(os.path.join(model_path, 'disease_encoder.pkl'))
        print(" disease_encoder loaded.")
        
        print("Loading symptoms_list...")
        symptoms_list = joblib.load(os.path.join(model_path, 'symptoms_list.pkl'))
        print(f" symptoms_list loaded ({len(symptoms_list)} items).")
        
        print("Loading specialist_mapping...")
        with open(os.path.join(os.path.dirname(__file__), "specialist_mapping.json"), 'r') as f:
            specialist_mapping = json.load(f)
        print(f" specialist_mapping loaded ({len(specialist_mapping)} items).")
        
        print("All models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")
        # We don't exit here so the app can still start, but endpoints will fail
        pass

@app.on_event("startup")
async def startup_event():
    load_models()

class SymptomRequest(BaseModel):
    symptoms: Optional[List[str]] = None
    text: Optional[str] = None

@app.post("/predict")
async def predict(request: SymptomRequest):
    if model is None or encoder is None or symptoms_list is None or specialist_mapping is None:
        raise HTTPException(status_code=500, detail="Models not loaded")

    user_symptoms = []
    
    # Extract symptoms if text provided
    if request.text:
        try:
            user_symptoms = extract_symptoms(request.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Symptom extraction failed: {str(e)}")
    elif request.symptoms:
        user_symptoms = request.symptoms
    else:
        raise HTTPException(status_code=400, detail="Either 'symptoms' list or 'text' must be provided")

    if not user_symptoms:
        return {
            "disease": "Unknown",
            "confidence": "0%",
            "predictions": [],
            "extracted_symptoms": [],
            "matched_symptoms": []
        }

    try:

        # Create input vector
        input_vector = np.zeros(len(symptoms_list))
        matched_symptoms = []
        
        # Define Custom Scorer
        def consensus_scorer(s1, s2):
            # s1 is query, s2 is candidate (or vice versa, it's symmetric usually)
            if s1 is None or s2 is None: return 0
            
            ratio = process.fuzz.ratio(s1, s2)
            partial = process.fuzz.partial_ratio(s1, s2)
            token_set = process.fuzz.token_set_ratio(s1, s2)
            
            # Average of Ratio and Max(Partial, TokenSet)
            # 60% Ratio (Structure) + 40% Flex (Partial/TokenSet)
            return (0.6 * ratio) + (0.4 * max(partial, token_set))

        # Map user symptoms to clinical columns
        for symptom in user_symptoms:
            match = None
            
            # 1. Exact Match (Cleaned)
            clean_symptom = symptom.lower().strip()
            if clean_symptom in symptoms_list:
                match = clean_symptom

            # 2. Token Set Ratio (Handles reordering/subsets: "chest pain" <-> "sharp chest pain")
            # If high confidence, it's a solid match
            if match is None:
                best_match, score = process.extractOne(symptom, symptoms_list, scorer=process.fuzz.token_set_ratio)
                if score >= 80: 
                    match = best_match
            
            # 3. Consensus Fuzzy Match (Handles "head hurts" -> "headache")
            if match is None:
                best_match, score = process.extractOne(symptom, symptoms_list, scorer=consensus_scorer)
                # Threshold ~60 determined via testing (head hurts -> 60.5)
                if score >= 60: 
                    match = best_match

            # 3. Add to vector if we found a valid match
            if match:
                idx = symptoms_list.index(match)
                input_vector[idx] = 1
                matched_symptoms.append(match)

        # Predict
        probabilities = model.predict_proba([input_vector])[0]
        
        # Get top 3
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        
        predictions = []
        for idx in top_3_indices:
            disease = encoder.inverse_transform([idx])[0]
            score = probabilities[idx] * 100
            predictions.append({
                "disease": disease,
                "specialist": specialist_mapping.get(disease, "General Physician"),
                "confidence": f"{score:.2f}%"
            })

        top_result = predictions[0]
        specialist = specialist_mapping.get(top_result["disease"], "General Physician")

        return {
            "disease": top_result["disease"],
            "specialist": specialist,
            "confidence": top_result["confidence"],
            "predictions": predictions,
            "extracted_symptoms": user_symptoms,
            "matched_symptoms": matched_symptoms
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": model is not None}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
