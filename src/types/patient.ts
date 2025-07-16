// Extended patient types for CRUD operations
export interface PatientRecord {
  id?: string; // Generated UUID for database
  encounter_id: number;
  patient_nbr: number;
  race?: string;
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
  diag_1: string;
  diag_2?: string;
  diag_3?: string;
  number_diagnoses: number;
  max_glu_serum: string;
  A1Cresult: string;
  metformin: string;
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
  insulin: string;
  "glyburide-metformin"?: string;
  "glipizide-metformin"?: string;
  "glimepiride-pioglitazone"?: string;
  "metformin-rosiglitazone"?: string;
  "metformin-pioglitazone"?: string;
  change: string;
  diabetesMed: string;
  readmitted?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string; // User ID who created the record
  updated_by?: string; // User ID who last updated the record
}

export interface CreatePatientRequest {
  encounter_id: number;
  patient_nbr: number;
  race?: string;
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
  diag_1: string;
  diag_2?: string;
  diag_3?: string;
  number_diagnoses: number;
  max_glu_serum: string;
  A1Cresult: string;
  metformin: string;
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
  insulin: string;
  "glyburide-metformin"?: string;
  "glipizide-metformin"?: string;
  "glimepiride-pioglitazone"?: string;
  "metformin-rosiglitazone"?: string;
  "metformin-pioglitazone"?: string;
  change: string;
  diabetesMed: string;
  readmitted?: string;
}

export interface UpdatePatientRequest {
  id: string;
  encounter_id?: number;
  patient_nbr?: number;
  race?: string;
  gender?: string;
  age?: string;
  weight?: string;
  admission_type_id?: number;
  discharge_disposition_id?: number;
  admission_source_id?: number;
  time_in_hospital?: number;
  payer_code?: string;
  medical_specialty?: string;
  num_lab_procedures?: number;
  num_procedures?: number;
  num_medications?: number;
  number_outpatient?: number;
  number_emergency?: number;
  number_inpatient?: number;
  diag_1?: string;
  diag_2?: string;
  diag_3?: string;
  number_diagnoses?: number;
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

export interface PatientListQuery {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  age_range?: string;
  diabetesMed?: string;
  readmitted?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

export interface PatientListResponse {
  patients: PatientRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PatientStatsResponse {
  total_patients: number;
  by_gender: {
    Male: number;
    Female: number;
  };
  by_age_group: {
    [key: string]: number;
  };
  by_diabetes_medication: {
    Yes: number;
    No: number;
  };
  by_readmission: {
    YES: number;
    NO: number;
    ">30": number;
    "<30": number;
  };
  average_hospital_stay: number;
  average_medications: number;
}
