import { SuccessResult } from "../utils/success_response";
import { BaseErrorException } from "../utils/error_handler";
import { Patient } from "../models/patient_model";
import type { IPatient } from "../models/patient_model";
import type { 
  PatientRecord, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientListQuery 
} from '../types/patient';
import { Types } from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert MongoDB document to PatientRecord
function documentToPatientRecord(doc: IPatient): PatientRecord {
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
    created_at: (doc as any).createdAt,
    updated_at: (doc as any).updatedAt,
    created_by: doc.created_by,
    updated_by: doc.updated_by,
  };
}

export async function createPatient(patientData: CreatePatientRequest, userId: string) {
  try {
    // Check if patient with same encounter_id already exists
    const existingByEncounter = await Patient.findOne({ encounter_id: patientData.encounter_id });
    if (existingByEncounter) {
      throw new BaseErrorException({
        message: "Patient with this encounter ID already exists",
        error: "DUPLICATE_ENCOUNTER_ID",
        logInfo: { encounter_id: patientData.encounter_id },
        code: 409,
      });
    }

    // Check if patient with same patient_nbr already exists
    const existingByPatientNbr = await Patient.findOne({ patient_nbr: patientData.patient_nbr });
    if (existingByPatientNbr) {
      throw new BaseErrorException({
        message: "Patient with this patient number already exists",
        error: "DUPLICATE_PATIENT_NUMBER",
        logInfo: { patient_nbr: patientData.patient_nbr },
        code: 409,
      });
    }

    const patientDoc = await Patient.create({
      ...patientData,
      created_by: userId,
      updated_by: userId,
    });

    if (patientDoc) {
      return new SuccessResult({
        code: 201,
        message: "Patient created successfully",
        body: { patient: documentToPatientRecord(patientDoc) },
      });
    } else {
      throw new BaseErrorException({
        code: 500,
        message: "Failed to create patient",
        error: "MONGO_INSERTION_ERROR",
        logInfo: { patientData },
      });
    }
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to create patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function getPatientById(patientId: string) {
  try {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BaseErrorException({
        message: "Invalid patient ID format",
        error: "INVALID_PATIENT_ID",
        logInfo: { patientId },
        code: 400,
      });
    }

    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      throw new BaseErrorException({
        message: "Patient not found",
        error: "PATIENT_NOT_FOUND",
        logInfo: { patientId },
        code: 404,
      });
    }

    return new SuccessResult({
      code: 200,
      message: "Patient retrieved successfully",
      body: { patient: documentToPatientRecord(patient) },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function getPatientByEncounterId(encounterId: number) {
  try {
    const patient = await Patient.findOne({ encounter_id: encounterId });
    
    if (!patient) {
      throw new BaseErrorException({
        message: "Patient not found",
        error: "PATIENT_NOT_FOUND",
        logInfo: { encounterId },
        code: 404,
      });
    }

    return new SuccessResult({
      code: 200,
      message: "Patient retrieved successfully",
      body: { patient: documentToPatientRecord(patient) },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function getPatientByPatientNumber(patientNbr: number) {
  try {
    const patient = await Patient.findOne({ patient_nbr: patientNbr });
    
    if (!patient) {
      throw new BaseErrorException({
        message: "Patient not found",
        error: "PATIENT_NOT_FOUND",
        logInfo: { patientNbr },
        code: 404,
      });
    }

    return new SuccessResult({
      code: 200,
      message: "Patient retrieved successfully",
      body: { patient: documentToPatientRecord(patient) },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function getAllPatients(query: PatientListQuery = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      age_range,
      diabetesMed,
      readmitted,
      sort_by = 'createdAt',
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
          filter.age = { $regex: new RegExp(`\\[${min}-|\\[${max}-`) };
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
      filter.createdAt = {};
      if (date_from) {
        filter.createdAt.$gte = new Date(date_from);
      }
      if (date_to) {
        filter.createdAt.$lte = new Date(date_to);
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

    const totalPages = Math.ceil(total / limit);

    return new SuccessResult({
      code: 200,
      message: "Patients retrieved successfully",
      body: {
        patients: patients.map(p => documentToPatientRecord(p)),
        total,
        page,
        limit,
        total_pages: totalPages
      },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve patients",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function updatePatient(patientId: string, updateData: UpdatePatientRequest, userId: string) {
  try {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BaseErrorException({
        message: "Invalid patient ID format",
        error: "INVALID_PATIENT_ID",
        logInfo: { patientId },
        code: 400,
      });
    }

    // Check if patient exists
    const existingPatient = await Patient.findById(patientId);
    if (!existingPatient) {
      throw new BaseErrorException({
        message: "Patient not found",
        error: "PATIENT_NOT_FOUND",
        logInfo: { patientId },
        code: 404,
      });
    }

    // If updating encounter_id, check for conflicts
    if (updateData.encounter_id && updateData.encounter_id !== existingPatient.encounter_id) {
      const conflictingPatient = await Patient.findOne({ 
        encounter_id: updateData.encounter_id,
        _id: { $ne: patientId }
      });
      if (conflictingPatient) {
        throw new BaseErrorException({
          message: "Another patient with this encounter ID already exists",
          error: "DUPLICATE_ENCOUNTER_ID",
          logInfo: { encounter_id: updateData.encounter_id },
          code: 409,
        });
      }
    }

    // If updating patient_nbr, check for conflicts
    if (updateData.patient_nbr && updateData.patient_nbr !== existingPatient.patient_nbr) {
      const conflictingPatient = await Patient.findOne({ 
        patient_nbr: updateData.patient_nbr,
        _id: { $ne: patientId }
      });
      if (conflictingPatient) {
        throw new BaseErrorException({
          message: "Another patient with this patient number already exists",
          error: "DUPLICATE_PATIENT_NUMBER",
          logInfo: { patient_nbr: updateData.patient_nbr },
          code: 409,
        });
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        ...updateData,
        updated_by: userId,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      throw new BaseErrorException({
        code: 500,
        message: "Failed to update patient",
        error: "MONGO_UPDATE_ERROR",
        logInfo: { patientId, updateData },
      });
    }

    return new SuccessResult({
      code: 200,
      message: "Patient updated successfully",
      body: { patient: documentToPatientRecord(updatedPatient) },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to update patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function deletePatient(patientId: string) {
  try {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BaseErrorException({
        message: "Invalid patient ID format",
        error: "INVALID_PATIENT_ID",
        logInfo: { patientId },
        code: 400,
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new BaseErrorException({
        message: "Patient not found",
        error: "PATIENT_NOT_FOUND",
        logInfo: { patientId },
        code: 404,
      });
    }

    const deletedPatient = await Patient.findByIdAndDelete(patientId);
    
    if (!deletedPatient) {
      throw new BaseErrorException({
        code: 500,
        message: "Failed to delete patient",
        error: "MONGO_DELETE_ERROR",
        logInfo: { patientId },
      });
    }

    return new SuccessResult({
      code: 200,
      message: "Patient deleted successfully",
      body: {},
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to delete patient",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function getPatientStats() {
  try {
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

    const [genderStats, ageStats, diabetesMedStats, readmissionStats, basicStats] = await Promise.all([
      Patient.aggregate([
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 }
          }
        }
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: '$age',
            count: { $sum: 1 }
          }
        }
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: '$diabetesMed',
            count: { $sum: 1 }
          }
        }
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: '$readmitted',
            count: { $sum: 1 }
          }
        }
      ]),
      Patient.aggregate(pipeline)
    ]);

    const stats = {
      total_patients: basicStats[0]?.total_patients || 0,
      by_gender: Object.fromEntries(genderStats.map(s => [s._id, s.count])),
      by_age_group: Object.fromEntries(ageStats.map(s => [s._id, s.count])),
      by_diabetes_medication: Object.fromEntries(diabetesMedStats.map(s => [s._id, s.count])),
      by_readmission: Object.fromEntries(readmissionStats.map(s => [s._id || 'Unknown', s.count])),
      average_hospital_stay: Number((basicStats[0]?.avg_hospital_stay || 0).toFixed(2)),
      average_medications: Number((basicStats[0]?.avg_medications || 0).toFixed(2))
    };

    return new SuccessResult({
      code: 200,
      message: "Patient statistics retrieved successfully",
      body: { stats },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to retrieve patient statistics",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

export async function importSampleData(userId: string) {
  try {
    const sampleDataPath = path.join(__dirname, '../../sample_data.json');
    const rawData = fs.readFileSync(sampleDataPath, 'utf8');
    const samplePatients = JSON.parse(rawData);

    const created: PatientRecord[] = [];
    const errors: any[] = [];

    for (const patientData of samplePatients) {
      try {
        // Check for duplicates
        const existingByEncounter = await Patient.findOne({ encounter_id: patientData.encounter_id });
        const existingByPatientNbr = await Patient.findOne({ patient_nbr: patientData.patient_nbr });
        
        if (existingByEncounter || existingByPatientNbr) {
          continue; // Skip duplicates
        }

        const patientDoc = await Patient.create({
          ...patientData,
          created_by: userId,
          updated_by: userId,
        });

        if (patientDoc) {
          created.push(documentToPatientRecord(patientDoc));
        }
      } catch (error: any) {
        errors.push({
          patient_data: patientData,
          error: error.message
        });
      }
    }

    return new SuccessResult({
      code: 200,
      message: "Sample data imported successfully",
      body: {
        imported_count: created.length,
        errors
      },
    });
  } catch (error) {
    if (error instanceof BaseErrorException) {
      throw error;
    }
    throw new BaseErrorException({
      code: 500,
      message: "Failed to import sample data",
      error: "UNEXPECTED_ERROR",
      logInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}
