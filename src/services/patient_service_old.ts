import type { PatientRecord, CreatePatientRequest, UpdatePatientRequest, PatientListQuery, PatientListResponse, PatientStatsResponse } from '../types/patient';
import PatientModel from '../models/patient_model';

class PatientError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PatientError';
  }
}

class PatientService {
  async createPatient(patientData: CreatePatientRequest, userId: string): Promise<PatientRecord> {
    try {
      // Check if patient with same encounter_id already exists
      const existingByEncounter = await PatientModel.findByEncounterId(patientData.encounter_id);
      if (existingByEncounter) {
        throw new PatientError('Patient with this encounter ID already exists', 409);
      }

      // Check if patient with same patient_nbr already exists
      const existingByPatientNbr = await PatientModel.findByPatientNumber(patientData.patient_nbr);
      if (existingByPatientNbr) {
        throw new PatientError('Patient with this patient number already exists', 409);
      }

      const patient = await PatientModel.create(patientData, userId);
      return patient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to create patient', 500);
    }
  }

  async getPatientById(id: string): Promise<PatientRecord> {
    try {
      const patient = await PatientModel.findById(id);
      if (!patient) {
        throw new PatientError('Patient not found', 404);
      }
      return patient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to retrieve patient', 500);
    }
  }

  async getPatientByEncounterId(encounterId: number): Promise<PatientRecord> {
    try {
      const patient = await PatientModel.findByEncounterId(encounterId);
      if (!patient) {
        throw new PatientError('Patient not found', 404);
      }
      return patient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to retrieve patient', 500);
    }
  }

  async getPatientByPatientNumber(patientNbr: number): Promise<PatientRecord> {
    try {
      const patient = await PatientModel.findByPatientNumber(patientNbr);
      if (!patient) {
        throw new PatientError('Patient not found', 404);
      }
      return patient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to retrieve patient', 500);
    }
  }

  async getAllPatients(query: PatientListQuery): Promise<PatientListResponse> {
    try {
      const { patients, total } = await PatientModel.findAll(query);
      
      const page = query.page || 1;
      const limit = query.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        patients,
        total,
        page,
        limit,
        total_pages: totalPages
      };
    } catch (error) {
      throw new PatientError('Failed to retrieve patients', 500);
    }
  }

  async updatePatient(id: string, updateData: Omit<Partial<UpdatePatientRequest>, 'id'>, userId: string): Promise<PatientRecord> {
    try {
      // Check if patient exists
      const existingPatient = await PatientModel.findById(id);
      if (!existingPatient) {
        throw new PatientError('Patient not found', 404);
      }

      // If updating encounter_id or patient_nbr, check for conflicts
      if (updateData.encounter_id && updateData.encounter_id !== existingPatient.encounter_id) {
        const conflictingPatient = await PatientModel.findByEncounterId(updateData.encounter_id);
        if (conflictingPatient && conflictingPatient.id !== id) {
          throw new PatientError('Another patient with this encounter ID already exists', 409);
        }
      }

      if (updateData.patient_nbr && updateData.patient_nbr !== existingPatient.patient_nbr) {
        const conflictingPatient = await PatientModel.findByPatientNumber(updateData.patient_nbr);
        if (conflictingPatient && conflictingPatient.id !== id) {
          throw new PatientError('Another patient with this patient number already exists', 409);
        }
      }

      const updatedPatient = await PatientModel.update(id, updateData, userId);
      if (!updatedPatient) {
        throw new PatientError('Failed to update patient', 500);
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to update patient', 500);
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const patient = await PatientModel.findById(id);
      if (!patient) {
        throw new PatientError('Patient not found', 404);
      }

      const deleted = await PatientModel.delete(id);
      if (!deleted) {
        throw new PatientError('Failed to delete patient', 500);
      }
    } catch (error) {
      if (error instanceof PatientError) {
        throw error;
      }
      throw new PatientError('Failed to delete patient', 500);
    }
  }

  async getPatientStats(): Promise<PatientStatsResponse> {
    try {
      const stats = await PatientModel.getStats();
      return stats;
    } catch (error) {
      throw new PatientError('Failed to retrieve patient statistics', 500);
    }
  }

  // Bulk operations
  async createManyPatients(patientsData: CreatePatientRequest[], userId: string): Promise<{ 
    created: PatientRecord[], 
    errors: Array<{ index: number, error: string }> 
  }> {
    try {
      const created: PatientRecord[] = [];
      const errors: Array<{ index: number, error: string }> = [];

      for (let i = 0; i < patientsData.length; i++) {
        try {
          const patientData = patientsData[i];
          if (!patientData) {
            errors.push({ index: i, error: 'Invalid patient data' });
            continue;
          }
          
          // Check for conflicts
          const existingByEncounter = await PatientModel.findByEncounterId(patientData.encounter_id);
          if (existingByEncounter) {
            errors.push({ index: i, error: `Patient with encounter ID ${patientData.encounter_id} already exists` });
            continue;
          }

          const existingByPatientNbr = await PatientModel.findByPatientNumber(patientData.patient_nbr);
          if (existingByPatientNbr) {
            errors.push({ index: i, error: `Patient with patient number ${patientData.patient_nbr} already exists` });
            continue;
          }

          const patient = await PatientModel.create(patientData, userId);
          created.push(patient);
        } catch (error) {
          errors.push({ index: i, error: `Failed to create patient: ${error instanceof Error ? error.message : 'Unknown error'}` });
        }
      }

      return { created, errors };
    } catch (error) {
      throw new PatientError('Failed to create patients in bulk', 500);
    }
  }

  async deleteManyPatients(ids: string[]): Promise<{ deleted: number, errors: string[] }> {
    try {
      const errors: string[] = [];
      let deleted = 0;

      for (const id of ids) {
        try {
          const patient = await PatientModel.findById(id);
          if (!patient) {
            errors.push(`Patient with ID ${id} not found`);
            continue;
          }

          const success = await PatientModel.delete(id);
          if (success) {
            deleted++;
          } else {
            errors.push(`Failed to delete patient with ID ${id}`);
          }
        } catch (error) {
          errors.push(`Error deleting patient ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { deleted, errors };
    } catch (error) {
      throw new PatientError('Failed to delete patients in bulk', 500);
    }
  }

  // Import sample data
  async importSampleData(sampleData: any[]): Promise<{ imported: number, errors: string[] }> {
    try {
      const errors: string[] = [];
      const imported = await PatientModel.importSampleData(sampleData);

      return { imported, errors };
    } catch (error) {
      throw new PatientError('Failed to import sample data', 500);
    }
  }

  // Search functionality
  async searchPatients(searchTerm: string, filters?: Partial<PatientListQuery>): Promise<PatientRecord[]> {
    try {
      const query: PatientListQuery = {
        search: searchTerm,
        limit: 50, // Limit search results
        ...filters
      };

      const { patients } = await PatientModel.findAll(query);
      return patients;
    } catch (error) {
      throw new PatientError('Failed to search patients', 500);
    }
  }
}

export { PatientError };
export default new PatientService();
