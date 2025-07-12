// Types for diabetic patient data and readmission prediction
export interface DiabeticPatientData {
  encounter_id: number;
  patient_nbr: number;
  race: string;
  gender: string;
  age: string;
  weight?: string;
  admission_type_id: number;
  discharge_disposition_id: number;
  admission_source_id: number;
  time_in_hospital: number;
  payer_code?: string;
  medical_specialty?: string;
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;
  diag_1?: string;
  diag_2?: string;
  diag_3?: string;
  number_diagnoses: number;
  max_glu_serum?: string;
  A1Cresult?: string;
  metformin?: string;
  repaglinide?: string;
  nateglinide?: string;
  chlorpropamide?: string;
  glimepiride?: string;
  acetohexamide?: string;
  glipizide?: string;
  glyburide?: string;
  tolbutamide?: string;
  pioglitazone?: string;
  rosiglitazone?: string;
  acarbose?: string;
  miglitol?: string;
  troglitazone?: string;
  tolazamide?: string;
  examide?: string;
  citoglipton?: string;
  insulin?: string;
  "glyburide-metformin"?: string;
  "glipizide-metformin"?: string;
  "glimepiride-pioglitazone"?: string;
  "metformin-rosiglitazone"?: string;
  "metformin-pioglitazone"?: string;
  change?: string;
  diabetesMed?: string;
  readmitted?: string;
}

export interface ReadmissionPredictionRequest {
  patientData: DiabeticPatientData;
}

export interface ReadmissionPredictionResponse {
  confidence_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_factors: RiskFactor[];
  recommendations: string[];
  prediction_timestamp: string;
  model_version: string;
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
