#!/bin/bash

# Test the Flask ML API to see if it returns remedy parameter

echo "Testing Flask ML API for remedy parameter..."

# Test data
TEST_DATA='{
  "age": "[70-80)",
  "gender": "Female",
  "time_in_hospital": 10,
  "admission_type": 1,
  "discharge_disposition": 3,
  "admission_source": 7,
  "num_medications": 25,
  "num_lab_procedures": 45,
  "num_procedures": 4,
  "number_diagnoses": 9,
  "number_inpatient": 5,
  "number_outpatient": 3,
  "number_emergency": 2,
  "diabetesMed": "Yes",
  "change": "Ch",
  "A1Cresult": ">8",
  "max_glu_serum": ">200",
  "insulin": "Up",
  "metformin": "Up",
  "diagnosis_1": "428"
}'

echo "Testing Flask ML API directly..."
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  | jq '.'

echo -e "\n\nTesting Node.js API with same data..."
curl -X POST http://localhost:3000/readmission/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "$TEST_DATA" \
  | jq '.'

echo "Remedy parameter test completed!"
