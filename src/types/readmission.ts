// Types for diabetic patient data and readmission prediction (matching Flask ML API)
export interface DiabeticPatientData {
  // Required parameters (matching Flask ML API)
  age: string;
  gender: string;
  time_in_hospital: number;
  admission_type: number;
  discharge_disposition: number;
  admission_source: number;
  num_medications: number;
  num_lab_procedures: number;
  num_procedures: number;
  number_diagnoses: number;
  number_inpatient: number;
  number_outpatient: number;
  number_emergency: number;
  diabetesMed: string;
  change: string;
  A1Cresult: string;
  max_glu_serum: string;
  insulin: string;
  metformin: string;
  diagnosis_1: string;
}

export interface ReadmissionPredictionRequest {
  // Direct patient data (no nested structure)
  age: string;
  gender: string;
  time_in_hospital: number;
  admission_type: number;
  discharge_disposition: number;
  admission_source: number;
  num_medications: number;
  num_lab_procedures: number;
  num_procedures: number;
  number_diagnoses: number;
  number_inpatient: number;
  number_outpatient: number;
  number_emergency: number;
  diabetesMed: string;
  change: string;
  A1Cresult: string;
  max_glu_serum: string;
  insulin: string;
  metformin: string;
  diagnosis_1: string;
}

export interface ReadmissionPredictionResponse {
  status: "success" | "error";
  confidence_score?: number;
  remedy?: string | null; // New parameter from Flask ML API
  error?: string;
  required_fields?: string[];
}

export interface RiskFactor {
  factor: string;
  impact: "POSITIVE" | "NEGATIVE";
  weight: number;
  description: string;
}

export interface ReadmissionAnalysis {
  demographic_risk: number;
  clinical_risk: number;
  medication_risk: number;
  hospital_utilization_risk: number;
  lab_test_risk: number;
  overall_risk: number;
}
