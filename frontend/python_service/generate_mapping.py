
import joblib
import os
import json

def get_specialist(disease):
    d = disease.lower()
    if any(x in d for x in ['heart', 'cardiac', 'valve', 'aorta', 'coronary', 'myocardial', 'pericardial']):
        return 'Cardiologist'
    if any(x in d for x in ['skin', 'rash', 'acne', 'psoriasis', 'melanoma', 'dermatitis', 'eczema', 'hives', 'rosacea', 'wart']):
        return 'Dermatologist'
    if any(x in d for x in ['brain', 'neuro', 'sclerosis', 'epilepsy', 'alzheimer', 'parkinson', 'dementia', 'migraine', 'stroke', 'paralysis']):
        return 'Neurologist'
    if any(x in d for x in ['stomach', 'bowel', 'colon', 'gastritis', 'reflux', 'ulcer', 'colitis', 'pancrea', 'hernia', 'constipation', 'diarrhea', 'vomit', 'abdomen']):
        return 'Gastroenterologist'
    if any(x in d for x in ['kidney', 'renal', 'nephr']):
        return 'Nephrologist'
    if any(x in d for x in ['urine', 'urinary', 'bladder', 'cystitis', 'prostate', 'testic']):
        return 'Urologist'
    if any(x in d for x in ['lung', 'pulmonary', 'asthma', 'bronchitis', 'pneumonia', 'respiratory', 'copd', 'emphysema']):
        return 'Pulmonologist'
    if any(x in d for x in ['eye', 'retina', 'cataract', 'glaucoma', 'blindness', 'conjunctivitis', 'vision']):
        return 'Ophthalmologist'
    if any(x in d for x in ['ear', 'nose', 'throat', 'sinus', 'tonsillitis', 'laryngitis', 'pharyngitis', 'vertigo']):
        return 'ENT Specialist'
    if any(x in d for x in ['bone', 'fracture', 'arthritis', 'osteo', 'joint', 'knee', 'hip', 'spine', 'scoliosis', 'tendon', 'ligament']):
        return 'Orthopedist'
    if any(x in d for x in ['cancer', 'tumor', 'leukemia', 'lymphoma', 'carcinoma', 'sarcoma', 'malignant']):
        return 'Oncologist'
    if any(x in d for x in ['liver', 'hepatitis', 'cirrhosis', 'jaundice']):
        return 'Hepatologist'
    if any(x in d for x in ['female', 'pregnancy', 'uterine', 'ovarian', 'vaginal', 'menstrua', 'breast', 'cervical', 'endometriosis']):
        return 'Gynecologist'
    if any(x in d for x in ['child', 'pediatric']):
        return 'Pediatrician'
    if any(x in d for x in ['mental', 'schizophrenia', 'bipolar', 'anxiety', 'depression', 'psychosis', 'personality disorder', 'autism']):
        return 'Psychiatrist'
    if any(x in d for x in ['infection', 'bacterial', 'viral', 'malaria', 'dengue', 'typhoid', 'flu', 'influenza', 'measles', 'chickenpox']):
        return 'Infectious Disease Specialist'
    if any(x in d for x in ['diabetes', 'thyroid', 'hormone', 'adrenal', 'pituitary']):
        return 'Endocrinologist'
    if any(x in d for x in ['allergy', 'allergic']):
        return 'Allergist'
    if any(x in d for x in ['dental', 'tooth', 'gum', 'periodont']):
        return 'Dentist'
    
    return 'General Physician'

def generate_mapping():
    try:
        model_path = os.path.join(os.path.dirname(__file__), "models")
        encoder_path = os.path.join(model_path, 'disease_encoder.pkl')
        
        if not os.path.exists(encoder_path):
            print(f"Error: {encoder_path} not found.")
            return

        encoder = joblib.load(encoder_path)
        diseases = encoder.classes_
        
        mapping = {}
        for disease in diseases:
            mapping[disease] = get_specialist(disease)
            
        output_path = os.path.join(os.path.dirname(__file__), "specialist_mapping.json")
        with open(output_path, 'w') as f:
            json.dump(mapping, f, indent=2)
            
        print(f"Successfully generated mapping for {len(diseases)} diseases at {output_path}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    generate_mapping()
