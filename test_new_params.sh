#!/bin/bash

# Test script for the updated prediction endpoint matching Flask ML API

echo "Testing readmission prediction with Flask ML API structure..."

# Test data with the Flask ML API parameter names (no nested patientData)
TEST_DATA='{
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
  "diagnosis_1": "250.01"
}'

echo "Sending request to prediction endpoint..."

# Make the request
curl -X POST http://localhost:3000/readmission/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "$TEST_DATA" \
  | jq '.'

echo "Test completed!"
