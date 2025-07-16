# Readmission Prediction API - Frontend Developer Guide

## Overview
This API predicts hospital readmission risk for diabetic patients using machine learning. It returns a confidence score (0-100) and optional treatment recommendations.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🎯 Main Prediction Endpoint

### POST `/readmission/predict`
Predict readmission risk for a single patient.

#### Request Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

#### Request Body
Send patient data directly (no nesting):

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

#### Response
```json
{
  "code": 200,
  "message": "Readmission prediction completed successfully",
  "body": {
    "confidence_score": 67,
    "remedy": "Consider medication adjustment and lifestyle modifications"
  }
}
```

#### JavaScript/React Example
```javascript
const predictReadmission = async (patientData, authToken) => {
  try {
    const response = await fetch('http://localhost:3000/readmission/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.body; // { confidence_score: 67, remedy: "..." }
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
};

// Usage
const patientData = {
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
};

const prediction = await predictReadmission(patientData, userToken);
console.log(`Risk Score: ${prediction.confidence_score}%`);
if (prediction.remedy) {
  console.log(`Recommendation: ${prediction.remedy}`);
}
```

---

## 📊 Batch Prediction Endpoint

### POST `/readmission/predict/batch`
Predict for multiple patients (up to 100).

#### Request Body
```json
{
  "patientsData": [
    {
      "age": "[60-70)",
      "gender": "Male",
      // ... same fields as single prediction
    },
    {
      "age": "[50-60)",
      "gender": "Female",
      // ... another patient
    }
  ]
}
```

#### Response
```json
{
  "code": 200,
  "message": "Batch readmission prediction completed for 2 patients",
  "body": {
    "predictions": [
      {
        "confidence_score": 67,
        "remedy": "Consider medication adjustment"
      },
      {
        "confidence_score": 34,
        "remedy": null
      }
    ],
    "total_patients": 2
  }
}
```

---

## 🧪 Test Endpoint (No Auth Required)

### GET `/readmission/test`
Quick test with sample data - no authentication needed.

```javascript
const testPrediction = async () => {
  const response = await fetch('http://localhost:3000/readmission/test');
  const result = await response.json();
  return result.body; // { confidence_score: 48, remedy: "..." }
};
```

---

## 📝 Required Fields Reference

| Field | Type | Description | Valid Values |
|-------|------|-------------|--------------|
| `age` | string | Patient age range | `[0-10)`, `[10-20)`, `[20-30)`, `[30-40)`, `[40-50)`, `[50-60)`, `[60-70)`, `[70-80)`, `[80-90)`, `[90-100)` |
| `gender` | string | Patient gender | `Male`, `Female` |
| `time_in_hospital` | number | Days in hospital | 1-14 |
| `admission_type` | number | Type of admission | 1-8 |
| `discharge_disposition` | number | Discharge type | 1-30 |
| `admission_source` | number | Admission source | 1-26 |
| `num_medications` | number | Number of medications | 0-81 |
| `num_lab_procedures` | number | Number of lab procedures | 0-132 |
| `num_procedures` | number | Number of procedures | 0-6 |
| `number_diagnoses` | number | Number of diagnoses | 1-16 |
| `number_inpatient` | number | Previous inpatient visits | 0-21 |
| `number_outpatient` | number | Previous outpatient visits | 0-42 |
| `number_emergency` | number | Previous emergency visits | 0-76 |
| `diabetesMed` | string | Diabetes medication | `Yes`, `No` |
| `change` | string | Medication change | `No`, `Ch` |
| `A1Cresult` | string | A1C test result | `>7`, `>8`, `Norm`, `None` |
| `max_glu_serum` | string | Glucose serum level | `>200`, `>300`, `Norm`, `None` |
| `insulin` | string | Insulin prescription | `Down`, `Steady`, `Up`, `No` |
| `metformin` | string | Metformin prescription | `Down`, `Steady`, `Up`, `No` |
| `diagnosis_1` | string | Primary diagnosis code | ICD-9 3-digit code (e.g., "250", "428") |

---

## 🎨 Frontend Integration Guide

### 1. **Risk Level Visualization**
```javascript
const getRiskLevel = (score) => {
  if (score >= 60) return { level: 'HIGH', color: '#dc3545', text: 'High Risk' };
  if (score >= 30) return { level: 'MEDIUM', color: '#ffc107', text: 'Medium Risk' };
  return { level: 'LOW', color: '#28a745', text: 'Low Risk' };
};

const RiskIndicator = ({ score }) => {
  const risk = getRiskLevel(score);
  return (
    <div style={{ color: risk.color, fontWeight: 'bold' }}>
      {risk.text} ({score}%)
    </div>
  );
};
```

### 2. **Form Validation**
```javascript
const validatePatientData = (data) => {
  const required = [
    'age', 'gender', 'time_in_hospital', 'admission_type', 
    'discharge_disposition', 'admission_source', 'num_medications',
    'num_lab_procedures', 'num_procedures', 'number_diagnoses',
    'number_inpatient', 'number_outpatient', 'number_emergency',
    'diabetesMed', 'change', 'A1Cresult', 'max_glu_serum',
    'insulin', 'metformin', 'diagnosis_1'
  ];

  const missing = required.filter(field => !data[field] && data[field] !== 0);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
};
```

### 3. **Error Handling**
```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Show validation errors
    const validationErrors = error.response.data.body?.validationErrors || [];
    return validationErrors.map(err => err.message).join(', ');
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};
```

### 4. **Loading State Management**
```javascript
const [isLoading, setIsLoading] = useState(false);
const [prediction, setPrediction] = useState(null);
const [error, setError] = useState(null);

const handlePredict = async (patientData) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await predictReadmission(patientData, authToken);
    setPrediction(result);
  } catch (err) {
    setError(handleApiError(err));
  } finally {
    setIsLoading(false);
  }
};
```

---

## ⚠️ Error Responses

### 401 - Authentication Error
```json
{
  "error": "Unauthorized",
  "message": "Access token required"
}
```

### 400 - Validation Error
```json
{
  "code": 400,
  "message": "Validation failed",
  "body": {
    "validationErrors": [
      {
        "field": "/age",
        "message": "must be string",
        "value": 65
      }
    ]
  }
}
```

### 500 - Server Error
```json
{
  "code": 500,
  "message": "Internal server error"
}
```

---

## 🚀 Quick Start Checklist

- [ ] Get JWT authentication token
- [ ] Validate all required fields before sending request
- [ ] Handle loading states in UI
- [ ] Implement error handling for all scenarios
- [ ] Style confidence scores with color coding
- [ ] Display remedy suggestions when available
- [ ] Test with the `/readmission/test` endpoint first

---

## 📞 Support

For technical issues or questions, contact the backend development team.

**Need help?** Test your integration with the public test endpoint first: `GET /readmission/test`
