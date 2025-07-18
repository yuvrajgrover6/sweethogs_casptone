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

# Medical Readmission Prediction API

## Overview

The Medical Readmission Prediction API is a comprehensive system that provides machine learning predictions for patient readmission risk and complete patient data management. The system consists of:

1. **Node.js Backend API** (Authentication, Data Management & Patient CRUD) - `http://localhost:3000`
2. **Flask ML Service** (Prediction Engine) - `http://localhost:8080`

The Node.js API handles user authentication, patient data management, and data validation, while the Flask service runs the SingleShotCNN deep learning model for predictions.

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

### 1. Patient Management

#### Get All Patients
- **URL**: `/patients`
- **Method**: `GET`
- **Auth**: Required
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10, max: 100)
  - `search` (string): Search term for patient number, encounter ID, diagnosis, or medical specialty
  - `gender` (string): Filter by gender (`Male`, `Female`)
  - `age_range` (string): Filter by age range (e.g., `0-20`, `21-40`)
  - `diabetesMed` (string): Filter by diabetes medication (`Yes`, `No`)
  - `readmitted` (string): Filter by readmission status (`YES`, `NO`, `>30`, `<30`)
  - `sort_by` (string): Field to sort by
  - `sort_order` (string): Sort order (`asc`, `desc`)
  - `date_from` (string): Filter from date (YYYY-MM-DD)
  - `date_to` (string): Filter to date (YYYY-MM-DD)

**Example Request**:
```bash
curl -X GET "http://localhost:3000/patients?page=1&limit=10&gender=Male&diabetesMed=Yes" \
  -H "Authorization: Bearer <token>"
```

**Response**:
```json
{
  "code": 200,
  "message": "Patients retrieved successfully",
  "body": {
    "patients": [...],
    "total": 150,
    "page": 1,
    "limit": 10,
    "total_pages": 15
  }
}
```

#### Create New Patient
- **URL**: `/patients`
- **Method**: `POST`
- **Auth**: Required
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "encounter_id": 12345,
  "patient_nbr": 67890,
  "race": "Caucasian",
  "gender": "Male",
  "age": "[50-60)",
  "weight": "75-100",
  "admission_type_id": 1,
  "discharge_disposition_id": 1,
  "admission_source_id": 7,
  "time_in_hospital": 3,
  "payer_code": "MC",
  "medical_specialty": "InternalMedicine",
  "num_lab_procedures": 40,
  "num_procedures": 1,
  "num_medications": 15,
  "number_outpatient": 0,
  "number_emergency": 0,
  "number_inpatient": 0,
  "diag_1": "414.01",
  "diag_2": "V45.81",
  "diag_3": "414.01",
  "number_diagnoses": 9,
  "max_glu_serum": "None",
  "A1Cresult": "None",
  "metformin": "No",
  "insulin": "Up",
  "change": "Ch",
  "diabetesMed": "Yes",
  "readmitted": "NO"
}
```

#### Get Patient by ID
- **URL**: `/patients/:id`
- **Method**: `GET`
- **Auth**: Required

#### Update Patient
- **URL**: `/patients/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**: Partial patient data (same structure as create, but all fields optional except those being updated)

#### Delete Patient
- **URL**: `/patients/:id`
- **Method**: `DELETE`
- **Auth**: Required

#### Get Patient by Encounter ID
- **URL**: `/patients/encounter/:encounterId`
- **Method**: `GET`
- **Auth**: Required

#### Get Patient by Patient Number
- **URL**: `/patients/patient-number/:patientNumber`
- **Method**: `GET`
- **Auth**: Required

#### Get Patient Statistics
- **URL**: `/patients/stats`
- **Method**: `GET`
- **Auth**: Required

**Response**:
```json
{
  "code": 200,
  "message": "Patient statistics retrieved successfully",
  "body": {
    "stats": {
      "total_patients": 1000,
      "by_gender": {
        "Male": 450,
        "Female": 550
      },
      "by_age_group": {
        "[0-10)": 50,
        "[10-20)": 75,
        "[50-60)": 200
      },
      "by_diabetes_medication": {
        "Yes": 800,
        "No": 200
      },
      "by_readmission": {
        "YES": 100,
        "NO": 700,
        ">30": 150,
        "<30": 50
      },
      "average_hospital_stay": 4.2,
      "average_medications": 12.5
    }
  }
}
```

#### Import Sample Data
- **URL**: `/patients/import-sample`
- **Method**: `POST`
- **Auth**: Required
- **Description**: Imports patient data from the `sample_data.json` file

### 2. Test Prediction (Public)

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
}
```

#### Request Example (cURL):

```bash
curl -X POST "http://localhost:3000/readmission/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
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
    age: "[60-70)",
    gender: "Male",
    time_in_hospital: 5,
    admission_type: 1,
    discharge_disposition: 1,
    admission_source: 7,
    num_medications: 12,
    num_lab_procedures: 35,
    num_procedures: 2,
    number_diagnoses: 5,
    number_inpatient: 1,
    number_outpatient: 3,
    number_emergency: 1,
    diabetesMed: "Yes",
    change: "Ch",
    A1Cresult: ">8",
    max_glu_serum: ">200",
    insulin: "Up",
    metformin: "Steady",
    diagnosis_1: "250"
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

### 5. Generate PDF Report (Protected)

**Endpoint:** `POST /readmission/generate-pdf`  
**Authentication:** Required  
**Description:** Generate a professional PDF medical report for readmission prediction

#### Request Body Schema:

Option 1 - With existing prediction data:
```json
{
  "patientData": {
    // Patient data (same structure as prediction endpoint)
  },
  "confidenceScore": 0.74,
  "remedy": "AI-generated medical insights and recommendations"
}
```

Option 2 - Auto-prediction (system will predict automatically):
```json
{
  "patientData": {
    // Patient data (same structure as prediction endpoint)
  }
}
```

#### Request Example:

```bash
curl -X POST "http://localhost:3000/readmission/generate-pdf" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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
    "remedy": "Despite well-controlled diabetes, this patient has elevated readmission risk. Focus on robust post-discharge planning and medication reconciliation."
  }' \
  --output "medical_report.pdf"
```

#### Response:

The endpoint returns a PDF file as binary data with appropriate headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="medical_report_TIMESTAMP.pdf"`

The generated PDF includes:
- **Institutional branding** (Humber College & Team SweatHogs)
- **Patient information** in formatted tables
- **Risk assessment** with visual charts
- **AI-generated medical insights** and recommendations
- **Risk explanation** and disclaimers
- **Professional medical report formatting**

---

## Patient Data Field Specifications

### Required Fields:

- `age` (string): Age range - Values: "[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"
- `gender` (string): Patient gender - Values: "Male", "Female"
- `time_in_hospital` (number): Days in hospital (1-14)
- `admission_type` (number): Admission type (1-8)
- `discharge_disposition` (number): Discharge disposition ID (1-30)
- `admission_source` (number): Admission source ID (1-26)
- `num_medications` (number): Number of medications (0-81)
- `num_lab_procedures` (number): Number of lab procedures (0-132)
- `num_procedures` (number): Number of procedures (0-6)
- `number_diagnoses` (number): Total number of diagnoses (1-16)
- `number_inpatient` (number): Number of inpatient visits (0-21)
- `number_outpatient` (number): Number of outpatient visits (0-42)
- `number_emergency` (number): Number of emergency visits (0-76)
- `diabetesMed` (string): Diabetes medication prescribed - Values: "Yes", "No"
- `change` (string): Medication change - Values: "No", "Ch"
- `A1Cresult` (string): HbA1c test result - Values: ">7", ">8", "Norm", "None"
- `max_glu_serum` (string): Glucose serum test result - Values: ">200", ">300", "Norm", "None"
- `insulin` (string): Insulin medication - Values: "Down", "Steady", "Up", "No"
- `metformin` (string): Metformin medication - Values: "Down", "Steady", "Up", "No"
- `diagnosis_1` (string): Primary diagnosis code (ICD-9 3-digit code, e.g., "250", "428")

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
