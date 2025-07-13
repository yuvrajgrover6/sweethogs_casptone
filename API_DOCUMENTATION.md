# Medical Readmission Prediction API

## Overview

The Medical Readmission Prediction API is a comprehensive system that provides machine learning predictions for patient readmission risk. The system consists of:

1. **Node.js Backend API** (Authentication & Data Management) - `http://localhost:3000`
2. **Flask ML Service** (Prediction Engine) - `http://localhost:8080`

The Node.js API handles user authentication and data validation, while the Flask service runs the SingleShotCNN deep learning model for predictions.

## Base URLs

```
Node.js API: http://localhost:3000
Flask ML Service: http://localhost:8080
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Test Prediction (Public)

**Endpoint:** `GET /readmission/test`  
**Authentication:** Not required  
**Description:** Test endpoint with sample patient data

#### Request Example:

```bash
curl -X GET "http://localhost:3000/readmission/test" \
  -H "Content-Type: application/json"
```

#### Response Example:

```json
{
  "code": 200,
  "message": "Test prediction completed successfully",
  "body": {
    "confidence_score": 48,
    "remedy": "Consider medication adjustment and lifestyle modifications"
  }
}
```

---

### 2. Single Patient Prediction (Protected)

**Endpoint:** `POST /readmission/predict`  
**Authentication:** Required  
**Description:** Predict readmission risk for a single patient

#### Request Headers:

```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

#### Request Body Schema:

```json
{
  "patientData": {
    "encounter_id": 123456,
    "patient_nbr": 789012,
    "race": "Caucasian",
    "gender": "Male",
    "age": "[60-70)",
    "weight": "?",
    "admission_type_id": 1,
    "discharge_disposition_id": 1,
    "admission_source_id": 7,
    "time_in_hospital": 5,
    "payer_code": "MC",
    "medical_specialty": "InternalMedicine",
    "num_lab_procedures": 35,
    "num_procedures": 2,
    "num_medications": 12,
    "number_outpatient": 3,
    "number_emergency": 1,
    "number_inpatient": 1,
    "diag_1": "250.01",
    "diag_2": "401.9",
    "diag_3": "?",
    "number_diagnoses": 5,
    "max_glu_serum": ">200",
    "A1Cresult": ">8",
    "metformin": "Steady",
    "insulin": "Up",
    "change": "Ch",
    "diabetesMed": "Yes"
  }
}
```

#### Request Example (cURL):

```bash
curl -X POST "http://localhost:3000/readmission/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientData": {
        "encounter_id": 123456,
        "patient_nbr": 789012,
        "race": "Caucasian",
        "gender": "Male",
        "age": "[60-70)",
        "weight": "?",
        "admission_type_id": 1,
        "discharge_disposition_id": 1,
        "admission_source_id": 7,
        "time_in_hospital": 5,
        "payer_code": "MC",
        "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 35,
        "num_procedures": 2,
        "num_medications": 12,
        "number_outpatient": 3,
        "number_emergency": 1,
        "number_inpatient": 1,
        "diag_1": "250.01",
        "diag_2": "401.9",
        "diag_3": "?",
        "number_diagnoses": 5,
        "max_glu_serum": ">200",
        "A1Cresult": ">8",
        "metformin": "Steady",
        "insulin": "Up",
        "change": "Ch",
        "diabetesMed": "Yes"
    }
}'
```

#### Request Example (JavaScript/Fetch):

```javascript
const response = await fetch("http://localhost:3000/readmission/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    patientData: {
      encounter_id: 123456,
      patient_nbr: 789012,
      race: "Caucasian",
      gender: "Male",
      age: "[60-70)",
      weight: "?",
      admission_type_id: 1,
      discharge_disposition_id: 1,
      admission_source_id: 7,
      time_in_hospital: 5,
      payer_code: "MC",
      medical_specialty: "InternalMedicine",
      num_lab_procedures: 35,
      num_procedures: 2,
      num_medications: 12,
      number_outpatient: 3,
      number_emergency: 1,
      number_inpatient: 1,
      diag_1: "250.01",
      diag_2: "401.9",
      diag_3: "?",
      number_diagnoses: 5,
      max_glu_serum: ">200",
      A1Cresult: ">8",
      metformin: "Steady",
      insulin: "Up",
      change: "Ch",
      diabetesMed: "Yes",
    },
  }),
});

const data = await response.json();
console.log(data);
```

#### Response Example:

```json
{
  "code": 200,
  "message": "Readmission prediction completed successfully",
  "body": {
    "confidence_score": 48,
    "remedy": "Consider medication adjustment and lifestyle modifications"
  }
}
```

---

### 3. Batch Prediction (Protected)

**Endpoint:** `POST /readmission/predict/batch`  
**Authentication:** Required  
**Description:** Predict readmission risk for multiple patients (up to 100)

#### Request Body Schema:

```json
{
  "patientsData": [
    {
      "encounter_id": 123456,
      "patient_nbr": 789012
      // ... same patient data structure as single prediction
    },
    {
      "encounter_id": 123457,
      "patient_nbr": 789013
      // ... additional patient data
    }
    // ... up to 100 patients
  ]
}
```

#### Request Example:

```bash
curl -X POST "http://localhost:3000/readmission/predict/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientsData": [
        {
            "encounter_id": 123456,
            "patient_nbr": 789012,
            "race": "Caucasian",
            "gender": "Male",
            "age": "[60-70)",
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 5,
            "num_lab_procedures": 35,
            "num_procedures": 2,
            "num_medications": 12,
            "number_outpatient": 3,
            "number_emergency": 1,
            "number_inpatient": 1,
            "diag_1": "250.01",
            "number_diagnoses": 5,
            "max_glu_serum": ">200",
            "A1Cresult": ">8",
            "diabetesMed": "Yes"
        }
    ]
}'
```

#### Response Example:

```json
{
  "code": 200,
  "message": "Batch readmission prediction completed for 1 patients",
  "body": {
    "predictions": [
      {
        "confidence_score": 48,
        "remedy": "Consider medication adjustment and lifestyle modifications"
      }
    ],
    "total_patients": 1
  }
}
```

---

### 4. Model Information (Protected)

**Endpoint:** `GET /readmission/model-info`  
**Authentication:** Required  
**Description:** Get information about the prediction model

#### Request Example:

```bash
curl -X GET "http://localhost:3000/readmission/model-info" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Example:

```json
{
  "code": 200,
  "message": "Model information retrieved successfully",
  "body": {
    "model_version": "v1.0.0",
    "model_type": "Risk Scoring Algorithm",
    "description": "Diabetic patient readmission risk prediction model",
    "features": {
      "demographic_factors": ["age", "gender", "race"],
      "clinical_factors": [
        "time_in_hospital",
        "number_diagnoses",
        "admission_type_id",
        "discharge_disposition_id",
        "medical_specialty"
      ],
      "medication_factors": [
        "num_medications",
        "diabetes_medications",
        "medication_changes",
        "insulin_usage"
      ],
      "utilization_factors": [
        "number_inpatient",
        "number_emergency",
        "number_outpatient"
      ],
      "lab_factors": ["num_lab_procedures", "A1Cresult", "max_glu_serum"]
    },
    "risk_thresholds": {
      "low_risk": "< 30%",
      "medium_risk": "30-60%",
      "high_risk": "> 60%"
    },
    "accuracy_metrics": {
      "sensitivity": "78%",
      "specificity": "72%",
      "auc_roc": "0.75",
      "precision": "69%",
      "recall": "78%"
    }
  }
}
```

---

## Patient Data Field Specifications

### Required Fields:

- `encounter_id` (number): Unique encounter identifier
- `patient_nbr` (number): Unique patient identifier
- `race` (string): Patient race - Values: "Caucasian", "AfricanAmerican", "Asian", "Hispanic", "Other", "?"
- `gender` (string): Patient gender - Values: "Male", "Female", "Unknown/Invalid"
- `age` (string): Age range - Values: "[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"
- `admission_type_id` (number): Admission type (1-8)
- `discharge_disposition_id` (number): Discharge disposition ID
- `admission_source_id` (number): Admission source ID
- `time_in_hospital` (number): Days in hospital (1-14)
- `num_lab_procedures` (number): Number of lab procedures
- `num_procedures` (number): Number of procedures
- `num_medications` (number): Number of medications
- `number_outpatient` (number): Number of outpatient visits
- `number_emergency` (number): Number of emergency visits
- `number_inpatient` (number): Number of inpatient visits
- `diag_1` (string): Primary diagnosis
- `number_diagnoses` (number): Total number of diagnoses
- `max_glu_serum` (string): Glucose serum test result - Values: "None", "Norm", ">200", ">300", "?"
- `A1Cresult` (string): HbA1c test result - Values: "None", "Norm", ">7", ">8", "?"
- `diabetesMed` (string): Diabetes medication prescribed - Values: "Yes", "No"

### Optional Fields:

- `weight` (string): Patient weight (often "?")
- `payer_code` (string): Insurance payer code
- `medical_specialty` (string): Medical specialty
- `diag_2` (string): Secondary diagnosis
- `diag_3` (string): Tertiary diagnosis
- `metformin` (string): Metformin medication - Values: "No", "Steady", "Up", "Down"
- `insulin` (string): Insulin medication - Values: "No", "Steady", "Up", "Down"
- `change` (string): Medication change - Values: "No", "Ch"

---

## Response Format

All API responses follow this structure:

```json
{
  "code": 200,
  "message": "Success message",
  "body": {
    // Response data
  }
}
```

---

## Response Fields

### Prediction Response

- **`confidence_score`** (number): A score from 0-100 representing the likelihood of hospital readmission
- **`remedy`** (string | null, optional): Recommended remedial actions or treatment suggestions from the ML model. This field may be null or absent if no specific remedy is suggested.

---

## Confidence Score Interpretation

The API returns a confidence score (0-100) representing readmission likelihood:

- **0-29**: Low Risk (Green) - Low probability of readmission
- **30-59**: Medium Risk (Yellow) - Moderate probability of readmission
- **60-100**: High Risk (Red) - High probability of readmission

---

## Error Responses

### Authentication Error (401):

```json
{
  "error": "Unauthorized",
  "message": "Access token required"
}
```

### Validation Error (400):

```json
{
  "code": 400,
  "message": "Validation failed",
  "body": {
    "validationErrors": [
      {
        "field": "/patientData/encounter_id",
        "message": "must be number",
        "value": "invalid_value"
      }
    ]
  }
}
```

### Server Error (500):

```json
{
  "code": 500,
  "message": "Internal server error"
}
```

---

## Frontend Integration Tips

1. **Authentication Flow**: Ensure user authentication before calling protected endpoints
2. **Error Handling**: Implement proper error handling for validation and server errors
3. **Loading States**: Show loading indicators during API calls
4. **Score Visualization**: Use color coding for confidence scores (Green/Yellow/Red)
5. **Batch Processing**: For multiple patients, use the batch endpoint for better performance
6. **Input Validation**: Validate patient data on frontend before sending to API

---

## Rate Limiting

- Batch endpoint limited to 100 patients per request
- No other rate limits currently implemented

---

## Support

For questions or issues, contact the backend development team.
