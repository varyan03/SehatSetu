
import joblib
import os
import json

def list_diseases():
    try:
        model_path = os.path.join(os.path.dirname(__file__), "models")
        encoder_path = os.path.join(model_path, 'disease_encoder.pkl')
        
        if not os.path.exists(encoder_path):
            print(f"Error: {encoder_path} not found.")
            return

        encoder = joblib.load(encoder_path)
        diseases = encoder.classes_
        
        print(json.dumps(list(diseases), indent=2))
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    list_diseases()
