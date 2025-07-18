#!/bin/bash
# Test PDF generation with automatic prediction

echo "🔐 Getting authentication token..."

# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got authentication token"
echo "🤖 Testing PDF generation with automatic prediction..."

# Test PDF generation with only patient data (let the system predict)
curl -X POST http://localhost:3000/readmission/generate-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientData": {
      "age": "[70-80)",
      "gender": "Male", 
      "time_in_hospital": 7,
      "admission_type": 1,
      "discharge_disposition": 1,
      "admission_source": 1,
      "num_medications": 15,
      "num_lab_procedures": 45,
      "num_procedures": 3,
      "number_diagnoses": 5,
      "number_inpatient": 2,
      "number_outpatient": 3,
      "number_emergency": 1,
      "diabetesMed": "Yes",
      "change": "Ch",
      "A1Cresult": ">8",
      "max_glu_serum": ">200",
      "insulin": "Up",
      "metformin": "Steady",
      "diagnosis_1": "250.01"
    }
  }' \
  --output "test_auto_prediction_report.pdf"

if [ $? -eq 0 ]; then
  echo "✅ PDF with auto-prediction generated successfully: test_auto_prediction_report.pdf"
  echo "📊 File size: $(ls -lh test_auto_prediction_report.pdf | awk '{print $5}')"
else
  echo "❌ PDF generation with auto-prediction failed"
fi
