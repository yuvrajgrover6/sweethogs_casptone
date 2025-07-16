# Patient Management API Documentation

## Overview

This API provides comprehensive patient management capabilities for the diabetic readmission prediction system. All endpoints require JWT authentication unless specified otherwise.

## Base URL
```
http://localhost:3000
```

## Authentication

Include the JWT token in the Authorization header for all requests:
```
Authorization: Bearer <your_jwt_token>
```

To get a token, first register or login:
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## Patient Management Endpoints

### 1. Get All Patients

**GET** `/patients`

Retrieve a paginated list of patients with optional filtering and sorting.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search across patient number, encounter ID, diagnosis, medical specialty
- `gender` (string, optional): Filter by gender (`Male`, `Female`)
- `age_range` (string, optional): Filter by age range (format: `min-max`, e.g., `40-60`)
- `diabetesMed` (string, optional): Filter by diabetes medication (`Yes`, `No`)
- `readmitted` (string, optional): Filter by readmission status (`YES`, `NO`, `>30`, `<30`)
- `sort_by` (string, optional): Field to sort by
- `sort_order` (string, optional): Sort order (`asc`, `desc`)
- `date_from` (string, optional): Filter from date (YYYY-MM-DD)
- `date_to` (string, optional): Filter to date (YYYY-MM-DD)

**Example Requests:**
```bash
# Get first 10 patients
curl -X GET "http://localhost:3000/patients" \
  -H "Authorization: Bearer <token>"

# Get male patients with diabetes medication
curl -X GET "http://localhost:3000/patients?gender=Male&diabetesMed=Yes&limit=5" \
  -H "Authorization: Bearer <token>"

# Search for patients with specific diagnosis
curl -X GET "http://localhost:3000/patients?search=414&page=2&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patients retrieved successfully",
  "body": {
    "patients": [
      {
        "id": "f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2",
        "encounter_id": 1110420,
        "patient_nbr": 96190083,
        "race": "Caucasian",
        "gender": "Male",
        "age": "[60-70)",
        "weight": "?",
        "admission_type_id": 1,
        "discharge_disposition_id": 1,
        "admission_source_id": 7,
        "time_in_hospital": 1,
        "medical_specialty": "Cardiology",
        "num_lab_procedures": 59,
        "num_procedures": 0,
        "num_medications": 10,
        "number_outpatient": 0,
        "number_emergency": 0,
        "number_inpatient": 0,
        "diag_1": "564",
        "diag_2": "414",
        "diag_3": "794",
        "number_diagnoses": 7,
        "max_glu_serum": "None",
        "A1Cresult": "None",
        "metformin": "No",
        "insulin": "Down",
        "change": "Ch",
        "diabetesMed": "Yes",
        "readmitted": "NO",
        "created_at": "2025-07-13T23:30:37.780Z",
        "updated_at": "2025-07-13T23:30:37.780Z",
        "created_by": "system",
        "updated_by": "system"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```

---

### 2. Create New Patient

**POST** `/patients`

Create a new patient record.

**Request Body:**
```json
{
  "encounter_id": 9999999,
  "patient_nbr": 9999999,
  "race": "Hispanic",
  "gender": "Female",
  "age": "[30-40)",
  "weight": "80",
  "admission_type_id": 1,
  "discharge_disposition_id": 1,
  "admission_source_id": 7,
  "time_in_hospital": 5,
  "medical_specialty": "Cardiology",
  "num_lab_procedures": 10,
  "num_procedures": 2,
  "num_medications": 8,
  "number_outpatient": 0,
  "number_emergency": 1,
  "number_inpatient": 0,
  "diag_1": "250.42",
  "diag_2": "414",
  "diag_3": "401",
  "number_diagnoses": 3,
  "max_glu_serum": "Norm",
  "A1Cresult": ">7",
  "metformin": "Steady",
  "insulin": "Up",
  "change": "Ch",
  "diabetesMed": "Yes",
  "readmitted": "NO"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "encounter_id": 9999999,
    "patient_nbr": 9999999,
    "gender": "Female",
    "age": "[30-40)",
    "admission_type_id": 1,
    "discharge_disposition_id": 1,
    "admission_source_id": 7,
    "time_in_hospital": 5,
    "num_lab_procedures": 10,
    "num_procedures": 2,
    "num_medications": 8,
    "number_outpatient": 0,
    "number_emergency": 1,
    "number_inpatient": 0,
    "diag_1": "250.42",
    "number_diagnoses": 3,
    "max_glu_serum": "Norm",
    "A1Cresult": ">7",
    "metformin": "Steady",
    "insulin": "Up",
    "change": "Ch",
    "diabetesMed": "Yes"
  }'
```

**Response:**
```json
{
  "code": 201,
  "message": "Patient created successfully",
  "body": {
    "patient": {
      "id": "new-patient-uuid",
      "encounter_id": 9999999,
      "patient_nbr": 9999999,
      // ... all patient fields
      "created_at": "2025-07-13T23:35:00.000Z",
      "updated_at": "2025-07-13T23:35:00.000Z",
      "created_by": "user-id",
      "updated_by": "user-id"
    }
  }
}
```

---

### 3. Get Patient by ID

**GET** `/patients/:id`

Retrieve a specific patient by their UUID.

**Example Request:**
```bash
curl -X GET http://localhost:3000/patients/f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient retrieved successfully",
  "body": {
    "patient": {
      "id": "f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2",
      // ... all patient fields
    }
  }
}
```

---

### 4. Update Patient

**PUT** `/patients/:id`

Update an existing patient record. Only include fields you want to update.

**Request Body (partial update):**
```json
{
  "medical_specialty": "Updated Cardiology",
  "time_in_hospital": 7,
  "readmitted": "YES"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/patients/f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "medical_specialty": "Updated Cardiology",
    "time_in_hospital": 7
  }'
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient updated successfully",
  "body": {
    "patient": {
      "id": "f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2",
      // ... updated patient fields
      "updated_at": "2025-07-13T23:40:00.000Z",
      "updated_by": "user-id"
    }
  }
}
```

---

### 5. Delete Patient

**DELETE** `/patients/:id`

Delete a patient record.

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/patients/f6e04c9c-b8e8-4b4c-b4cd-1558ca7824a2 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient deleted successfully",
  "body": {}
}
```

---

### 6. Get Patient by Encounter ID

**GET** `/patients/encounter/:encounterId`

Retrieve a patient by their encounter ID.

**Example Request:**
```bash
curl -X GET http://localhost:3000/patients/encounter/1110420 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient retrieved successfully",
  "body": {
    "patient": {
      "encounter_id": 1110420,
      // ... all patient fields
    }
  }
}
```

---

### 7. Get Patient by Patient Number

**GET** `/patients/patient-number/:patientNumber`

Retrieve a patient by their patient number.

**Example Request:**
```bash
curl -X GET http://localhost:3000/patients/patient-number/96190083 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient retrieved successfully",
  "body": {
    "patient": {
      "patient_nbr": 96190083,
      // ... all patient fields
    }
  }
}
```

---

### 8. Get Patient Statistics

**GET** `/patients/stats`

Retrieve comprehensive statistics about all patients.

**Example Request:**
```bash
curl -X GET http://localhost:3000/patients/stats \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Patient statistics retrieved successfully",
  "body": {
    "stats": {
      "total_patients": 100,
      "by_gender": {
        "Female": 54,
        "Male": 46
      },
      "by_age_group": {
        "[0-10)": 1,
        "[10-20)": 2,
        "[40-50)": 12,
        "[50-60)": 23,
        "[60-70)": 20,
        "[70-80)": 27
      },
      "by_diabetes_medication": {
        "Yes": 93,
        "No": 7
      },
      "by_readmission": {
        "NO": 42,
        ">30": 50,
        "<30": 8
      },
      "average_hospital_stay": 4.86,
      "average_medications": 15.12
    }
  }
}
```

---

### 9. Import Sample Data

**POST** `/patients/import-sample`

Import patient data from the sample_data.json file. This is useful for initial data loading.

**Example Request:**
```bash
curl -X POST http://localhost:3000/patients/import-sample \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "code": 200,
  "message": "Sample data imported successfully",
  "body": {
    "imported_count": 100,
    "errors": []
  }
}
```

---

## Patient Data Model

### Required Fields
- `encounter_id` (number): Unique encounter identifier
- `patient_nbr` (number): Unique patient number
- `gender` (string): "Male" or "Female"
- `age` (string): Age range format like "[50-60)"
- `admission_type_id` (number): Type of admission
- `discharge_disposition_id` (number): Discharge disposition
- `admission_source_id` (number): Source of admission
- `time_in_hospital` (number): Days in hospital
- `num_lab_procedures` (number): Number of lab procedures
- `num_procedures` (number): Number of procedures
- `num_medications` (number): Number of medications
- `number_outpatient` (number): Outpatient visits
- `number_emergency` (number): Emergency visits
- `number_inpatient` (number): Inpatient visits
- `diag_1` (string): Primary diagnosis
- `number_diagnoses` (number): Total diagnoses
- `max_glu_serum` (string): Glucose serum test result
- `A1Cresult` (string): A1C test result
- `metformin` (string): Metformin medication status
- `insulin` (string): Insulin medication status
- `change` (string): Medication change
- `diabetesMed` (string): "Yes" or "No"

### Optional Fields
- `race` (string): Patient race
- `weight` (string): Patient weight
- `payer_code` (string): Insurance payer code
- `medical_specialty` (string): Medical specialty
- `diag_2` (string): Secondary diagnosis
- `diag_3` (string): Tertiary diagnosis
- `readmitted` (string): "YES", "NO", ">30", "<30"
- Various medication fields (all optional)

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `409`: Conflict (duplicate encounter_id or patient_nbr)
- `500`: Internal Server Error

---

## Frontend Integration Examples

### React/JavaScript Examples

```javascript
// Get all patients with pagination
const getPatients = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await fetch(`/api/patients?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};

// Create new patient
const createPatient = async (patientData) => {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(patientData)
  });
  
  return response.json();
};

// Update patient
const updatePatient = async (patientId, updates) => {
  const response = await fetch(`/api/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(updates)
  });
  
  return response.json();
};

// Get patient statistics
const getPatientStats = async () => {
  const response = await fetch('/api/patients/stats', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};
```

### Vue.js/Axios Examples

```javascript
// Vue.js with Axios
import axios from 'axios';

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Get patients
const getPatients = (filters = {}) => {
  return axios.get('/api/patients', { params: filters });
};

// Create patient
const createPatient = (patientData) => {
  return axios.post('/api/patients', patientData);
};

// Update patient
const updatePatient = (id, updates) => {
  return axios.put(`/api/patients/${id}`, updates);
};
```

---

## Notes for Frontend Developer

1. **Authentication**: All endpoints require JWT authentication. Store the token securely and include it in all requests.

2. **Pagination**: Use the pagination parameters to implement table pagination on the frontend.

3. **Filtering**: Implement search and filter UI components that map to the query parameters.

4. **Error Handling**: Always check the response status and handle errors appropriately.

5. **Validation**: The API validates all input, but you should also implement frontend validation for better UX.

6. **Real-time Updates**: Consider implementing polling or WebSocket connections for real-time patient data updates.

7. **Performance**: Use debouncing for search inputs and implement virtual scrolling for large patient lists.

8. **Data Integration**: Patient data can be directly used with the existing readmission prediction endpoints by extracting the required fields.
