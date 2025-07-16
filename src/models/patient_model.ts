import mongoose, { Schema, Document } from 'mongoose';
import type { PatientRecord, CreatePatientRequest, UpdatePatientRequest, PatientListQuery } from '../types/patient';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Patient Schema
interface IPatient extends Document {
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
  glyburide_metformin?: string;
  glipizide_metformin?: string;
  glimepiride_pioglitazone?: string;
  metformin_rosiglitazone?: string;
  metformin_pioglitazone?: string;
  change: string;
  diabetesMed: string;
  readmitted?: string;
  created_by: string;
  updated_by: string;
}

const PatientSchema = new Schema<IPatient>({
  encounter_id: { type: Number, required: true, unique: true },
  patient_nbr: { type: Number, required: true, unique: true },
  race: { type: String },
  gender: { type: String, required: true, enum: ['Male', 'Female'] },
  age: { type: String, required: true },
  weight: { type: String },
  admission_type_id: { type: Number, required: true },
  discharge_disposition_id: { type: Number, required: true },
  admission_source_id: { type: Number, required: true },
  time_in_hospital: { type: Number, required: true },
  payer_code: { type: String },
  medical_specialty: { type: String },
  num_lab_procedures: { type: Number, required: true },
  num_procedures: { type: Number, required: true },
  num_medications: { type: Number, required: true },
  number_outpatient: { type: Number, required: true },
  number_emergency: { type: Number, required: true },
  number_inpatient: { type: Number, required: true },
  diag_1: { type: String, required: true },
  diag_2: { type: String },
  diag_3: { type: String },
  number_diagnoses: { type: Number, required: true },
  max_glu_serum: { type: String, required: true },
  A1Cresult: { type: String, required: true },
  metformin: { type: String, required: true },
  repaglinide: { type: String },
  nateglinide: { type: String },
  chlorpropamide: { type: String },
  glimepiride: { type: String },
  acetohexamide: { type: String },
  glipizide: { type: String },
  glyburide: { type: String },
  tolbutamide: { type: String },
  pioglitazone: { type: String },
  rosiglitazone: { type: String },
  acarbose: { type: String },
  miglitol: { type: String },
  troglitazone: { type: String },
  tolazamide: { type: String },
  examide: { type: String },
  citoglipton: { type: String },
  insulin: { type: String, required: true },
  glyburide_metformin: { type: String },
  glipizide_metformin: { type: String },
  glimepiride_pioglitazone: { type: String },
  metformin_rosiglitazone: { type: String },
  metformin_pioglitazone: { type: String },
  change: { type: String, required: true },
  diabetesMed: { type: String, required: true },
  readmitted: { type: String },
  created_by: { type: String, required: true },
  updated_by: { type: String, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance (encounter_id and patient_nbr already have unique indexes)
PatientSchema.index({ gender: 1 });
PatientSchema.index({ age: 1 });
PatientSchema.index({ diabetesMed: 1 });
PatientSchema.index({ readmitted: 1 });
PatientSchema.index({ medical_specialty: 1 });

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

export { Patient };
export type { IPatient };
export default Patient;
