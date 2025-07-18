#!/bin/bash
# Test PDF generation endpoint

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
echo "📄 Testing PDF generation..."

# Test PDF generation with sample patient data
curl -X POST http://localhost:3000/readmission/generate-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientData": {
      "age": "[50-60)",
      "gender": "Female", 
      "time_in_hospital": 5,
      "admission_type": 1,
      "discharge_disposition": 1,
      "admission_source": 1,
      "num_medications": 10,
      "num_lab_procedures": 30,
      "num_procedures": 2,
      "number_diagnoses": 3,
      "number_inpatient": 1,
      "number_outpatient": 2,
      "number_emergency": 0,
      "diabetesMed": "Yes",
      "change": "Ch",
      "A1Cresult": "Norm",
      "max_glu_serum": "None",
      "insulin": "No",
      "metformin": "Steady",
      "diagnosis_1": "250.00"
    },
    "confidenceScore": 0.74,
    "remedy": "Despite well-controlled diabetes (normal A1C, metformin steady, no insulin, primary diagnosis 250.00), this female patient in her 50s has a high readmission risk score of 0.74. This suggests the elevated risk is likely driven by her other two diagnoses, the acute reason for her emergency admission, or the complexity of her overall care (10 medications, regimen changed, 30 lab procedures). Focus on robust post-discharge planning, including thorough medication reconciliation and close, multidisciplinary follow-up for all her medical conditions, not just diabetes, to mitigate this elevated readmission risk. Patient education on new medications and symptom monitoring is crucial."
  }' \
  --output "test_medical_report.pdf"

if [ $? -eq 0 ]; then
  echo "✅ PDF generated successfully: test_medical_report.pdf"
  echo "📊 File size: $(ls -lh test_medical_report.pdf | awk '{print $5}')"
else
  echo "❌ PDF generation failed"
fi
