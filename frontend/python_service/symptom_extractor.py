import sys
import json
import spacy
from googletrans import Translator
import os

# 1. FORCE SILENCE: Prevent scispacy/spacy from printing warnings to stdout
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    nlp = spacy.load("en_core_sci_sm")
except Exception as e:
    # If imported, we might want to raise, but for now lets print error if direct run
    if __name__ == "__main__":
        print(json.dumps({"status": "error", "message": f"Failed to load model: {str(e)}"}))
    nlp = None

def extract_symptoms(text):
    if nlp is None:
        raise Exception("Spacy model not loaded")

    # 1. Translation
    translator = Translator()
    translated = translator.translate(text, dest='en').text
    
    doc = nlp(translated)
    entities = [ent.text.lower() for ent in doc.ents]
    return list(set(entities))

def run_demo():
    # Read all data from stdin
    try:
        raw_text = sys.stdin.read().strip()
        if not raw_text:
            return

        symptoms = extract_symptoms(raw_text)

        result = {
            "status": "success",
            "extracted_symptoms": symptoms
        }

        # 2. FLUSH STDOUT: Ensure the string is sent immediately and cleanly
        sys.stdout.write(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    run_demo()