#!/bin/bash

# Test the Flask ML API endpoint directly to ensure it matches our expected structure

echo "Testing Flask ML API directly at localhost:8080..."

# Test data matching Flask ML API requirements
FLASK_TEST_DATA='{
  "age": "[60-70)",
  "gender": "Male",
  "time_in_hospital": 5,
  "admission_type": 1,
  "discharge_disposition": 1,
  "admission_source": 7,
  "num_medications": 12,
  "num_lab_procedures": 35,
  "num_procedures": 2,
  "number_diagnoses": 5,
  "number_inpatient": 1,
  "number_outpatient": 3,
  "number_emergency": 1,
  "diabetesMed": "Yes",
  "change": "Ch",
  "A1Cresult": ">8",
  "max_glu_serum": ">200",
  "insulin": "Up",
  "metformin": "Steady",
  "diagnosis_1": "250"
}'

echo "Testing Flask ML API health endpoint..."
curl -X GET http://localhost:8080/health

echo -e "\n\nTesting Flask ML API prediction endpoint..."
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d "$FLASK_TEST_DATA" \
  | jq '.'

echo "Flask ML API test completed!"
