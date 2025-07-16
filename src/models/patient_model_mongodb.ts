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

// Create indexes for better performance
PatientSchema.index({ encounter_id: 1 });
PatientSchema.index({ patient_nbr: 1 });
PatientSchema.index({ gender: 1 });
PatientSchema.index({ age: 1 });
PatientSchema.index({ diabetesMed: 1 });
PatientSchema.index({ readmitted: 1 });
PatientSchema.index({ medical_specialty: 1 });

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

// MongoDB Patient Model
class PatientModel {
  // Helper method to convert MongoDB document to PatientRecord
  private documentToPatientRecord(doc: IPatient): PatientRecord {
    return {
      id: (doc._id as any).toString(),
      encounter_id: doc.encounter_id,
      patient_nbr: doc.patient_nbr,
      race: doc.race,
      gender: doc.gender,
      age: doc.age,
      weight: doc.weight,
      admission_type_id: doc.admission_type_id,
      discharge_disposition_id: doc.discharge_disposition_id,
      admission_source_id: doc.admission_source_id,
      time_in_hospital: doc.time_in_hospital,
      payer_code: doc.payer_code,
      medical_specialty: doc.medical_specialty,
      num_lab_procedures: doc.num_lab_procedures,
      num_procedures: doc.num_procedures,
      num_medications: doc.num_medications,
      number_outpatient: doc.number_outpatient,
      number_emergency: doc.number_emergency,
      number_inpatient: doc.number_inpatient,
      diag_1: doc.diag_1,
      diag_2: doc.diag_2,
      diag_3: doc.diag_3,
      number_diagnoses: doc.number_diagnoses,
      max_glu_serum: doc.max_glu_serum,
      A1Cresult: doc.A1Cresult,
      metformin: doc.metformin,
      repaglinide: doc.repaglinide,
      nateglinide: doc.nateglinide,
      chlorpropamide: doc.chlorpropamide,
      glimepiride: doc.glimepiride,
      acetohexamide: doc.acetohexamide,
      glipizide: doc.glipizide,
      glyburide: doc.glyburide,
      tolbutamide: doc.tolbutamide,
      pioglitazone: doc.pioglitazone,
      rosiglitazone: doc.rosiglitazone,
      acarbose: doc.acarbose,
      miglitol: doc.miglitol,
      troglitazone: doc.troglitazone,
      tolazamide: doc.tolazamide,
      examide: doc.examide,
      citoglipton: doc.citoglipton,
      insulin: doc.insulin,
      "glyburide-metformin": doc.glyburide_metformin,
      "glipizide-metformin": doc.glipizide_metformin,
      "glimepiride-pioglitazone": doc.glimepiride_pioglitazone,
      "metformin-rosiglitazone": doc.metformin_rosiglitazone,
      "metformin-pioglitazone": doc.metformin_pioglitazone,
      change: doc.change,
      diabetesMed: doc.diabetesMed,
      readmitted: doc.readmitted,
      created_at: (doc as any).created_at,
      updated_at: (doc as any).updated_at,
      created_by: doc.created_by,
      updated_by: doc.updated_by,
    };
  }

  // Create a new patient
  async create(patientData: CreatePatientRequest, userId: string): Promise<PatientRecord> {
    const newPatient = new Patient({
      ...patientData,
      created_by: userId,
      updated_by: userId,
    });

    const savedPatient = await newPatient.save();
    return this.documentToPatientRecord(savedPatient);
  }

  // Find patient by ID
  async findById(id: string): Promise<PatientRecord | null> {
    try {
      const patient = await Patient.findById(id);
      return patient ? this.documentToPatientRecord(patient) : null;
    } catch (error) {
      return null;
    }
  }

  // Find patient by patient number
  async findByPatientNumber(patient_nbr: number): Promise<PatientRecord | null> {
    const patient = await Patient.findOne({ patient_nbr });
    return patient ? this.documentToPatientRecord(patient) : null;
  }

  // Find patient by encounter ID
  async findByEncounterId(encounter_id: number): Promise<PatientRecord | null> {
    const patient = await Patient.findOne({ encounter_id });
    return patient ? this.documentToPatientRecord(patient) : null;
  }

  // Find all patients with filtering and pagination
  async findAll(query: PatientListQuery = {}): Promise<{ patients: PatientRecord[], total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      age_range,
      diabetesMed,
      readmitted,
      sort_by = 'created_at',
      sort_order = 'desc',
      date_from,
      date_to
    } = query;

    // Build MongoDB filter
    const filter: any = {};

    // Text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { patient_nbr: { $regex: searchRegex } },
        { encounter_id: { $regex: searchRegex } },
        { diag_1: { $regex: searchRegex } },
        { diag_2: { $regex: searchRegex } },
        { diag_3: { $regex: searchRegex } },
        { medical_specialty: { $regex: searchRegex } }
      ];
    }

    // Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // Age range filter
    if (age_range) {
      const parts = age_range.split('-');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          // This is a simplified age range filter
          // In practice, you might need more complex logic to parse age ranges like "[50-60)"
          filter.age = { $regex: new RegExp(`\\[${min}-|\\[${max}-|\\[${min + 10}-|\\[${max - 10}-`) };
        }
      }
    }

    // Diabetes medication filter
    if (diabetesMed) {
      filter.diabetesMed = diabetesMed;
    }

    // Readmission filter
    if (readmitted) {
      filter.readmitted = readmitted;
    }

    // Date range filter
    if (date_from || date_to) {
      filter.created_at = {};
      if (date_from) {
        filter.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        filter.created_at.$lte = new Date(date_to);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sort_by] = sort_order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Patient.countDocuments(filter)
    ]);

    return {
      patients: patients.map(p => this.documentToPatientRecord(p)),
      total
    };
  }

  // Update patient
  async update(id: string, updateData: UpdatePatientRequest, userId: string): Promise<PatientRecord | null> {
    try {
      const updatedPatient = await Patient.findByIdAndUpdate(
        id,
        {
          ...updateData,
          updated_by: userId,
        },
        { new: true, runValidators: true }
      );

      return updatedPatient ? this.documentToPatientRecord(updatedPatient) : null;
    } catch (error) {
      return null;
    }
  }

  // Delete patient
  async delete(id: string): Promise<boolean> {
    try {
      const result = await Patient.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Check if encounter ID exists
  async encounterIdExists(encounter_id: number, excludeId?: string): Promise<boolean> {
    const filter: any = { encounter_id };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await Patient.countDocuments(filter);
    return count > 0;
  }

  // Check if patient number exists
  async patientNumberExists(patient_nbr: number, excludeId?: string): Promise<boolean> {
    const filter: any = { patient_nbr };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await Patient.countDocuments(filter);
    return count > 0;
  }

  // Get patient statistics
  async getStats(): Promise<any> {
    const pipeline = [
      {
        $group: {
          _id: null,
          total_patients: { $sum: 1 },
          avg_hospital_stay: { $avg: '$time_in_hospital' },
          avg_medications: { $avg: '$num_medications' }
        }
      }
    ];

    const genderStats = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const ageStats = await Patient.aggregate([
      {
        $group: {
          _id: '$age',
          count: { $sum: 1 }
        }
      }
    ]);

    const diabetesMedStats = await Patient.aggregate([
      {
        $group: {
          _id: '$diabetesMed',
          count: { $sum: 1 }
        }
      }
    ]);

    const readmissionStats = await Patient.aggregate([
      {
        $group: {
          _id: '$readmitted',
          count: { $sum: 1 }
        }
      }
    ]);

    const basicStats = await Patient.aggregate(pipeline);

    return {
      total_patients: basicStats[0]?.total_patients || 0,
      by_gender: Object.fromEntries(genderStats.map(s => [s._id, s.count])),
      by_age_group: Object.fromEntries(ageStats.map(s => [s._id, s.count])),
      by_diabetes_medication: Object.fromEntries(diabetesMedStats.map(s => [s._id, s.count])),
      by_readmission: Object.fromEntries(readmissionStats.map(s => [s._id || 'Unknown', s.count])),
      average_hospital_stay: Number((basicStats[0]?.avg_hospital_stay || 0).toFixed(2)),
      average_medications: Number((basicStats[0]?.avg_medications || 0).toFixed(2))
    };
  }

  // Bulk create patients
  async bulkCreate(patientsData: CreatePatientRequest[], userId: string): Promise<{ created: PatientRecord[], errors: any[] }> {
    const created: PatientRecord[] = [];
    const errors: any[] = [];

    for (const patientData of patientsData) {
      try {
        const patient = await this.create(patientData, userId);
        created.push(patient);
      } catch (error: any) {
        errors.push({
          patient_data: patientData,
          error: error.message
        });
      }
    }

    return { created, errors };
  }

  // Import sample data from JSON file
  async importSampleData(userId: string): Promise<{ imported_count: number, errors: any[] }> {
    try {
      const sampleDataPath = path.join(__dirname, '../../sample_data.json');
      const rawData = fs.readFileSync(sampleDataPath, 'utf8');
      const samplePatients = JSON.parse(rawData);

      const { created, errors } = await this.bulkCreate(samplePatients, userId);

      return {
        imported_count: created.length,
        errors
      };
    } catch (error: any) {
      throw new Error(`Failed to import sample data: ${error.message}`);
    }
  }

  // Clear all patients (for testing purposes)
  async clearAll(): Promise<void> {
    await Patient.deleteMany({});
  }
}

export default PatientModel;
