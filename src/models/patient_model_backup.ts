import type { PatientRecord, CreatePatientRequest, UpdatePatientRequest, PatientListQuery } from '../types/patient';
import crypto from 'crypto';

// In-memory storage for patients (in production, this would be a database)
class PatientModel {
  private patients: PatientRecord[] = [];

  constructor() {
    // Initialize with some sample data for development
    this.loadSampleData();
  }

  private loadSampleData() {
    // This would typically load from a database
    // For now, we'll start with an empty array and load data when needed
  }

  async create(patientData: CreatePatientRequest, userId: string): Promise<PatientRecord> {
    const patient: PatientRecord = {
      id: crypto.randomUUID(),
      ...patientData,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: userId,
      updated_by: userId
    };

    this.patients.push(patient);
    return patient;
  }

  async findById(id: string): Promise<PatientRecord | null> {
    const patient = this.patients.find(p => p.id === id);
    return patient || null;
  }

  async findByPatientNumber(patient_nbr: number): Promise<PatientRecord | null> {
    const patient = this.patients.find(p => p.patient_nbr === patient_nbr);
    return patient || null;
  }

  async findByEncounterId(encounter_id: number): Promise<PatientRecord | null> {
    const patient = this.patients.find(p => p.encounter_id === encounter_id);
    return patient || null;
  }

  async findAll(query: PatientListQuery = {}): Promise<{ patients: PatientRecord[], total: number }> {
    let filteredPatients = [...this.patients];

    // Apply filters
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredPatients = filteredPatients.filter(p => 
        p.patient_nbr.toString().includes(searchTerm) ||
        p.encounter_id.toString().includes(searchTerm) ||
        p.diag_1?.toLowerCase().includes(searchTerm) ||
        p.medical_specialty?.toLowerCase().includes(searchTerm)
      );
    }

    if (query.gender) {
      filteredPatients = filteredPatients.filter(p => p.gender === query.gender);
    }

    if (query.diabetesMed) {
      filteredPatients = filteredPatients.filter(p => p.diabetesMed === query.diabetesMed);
    }

    if (query.readmitted) {
      filteredPatients = filteredPatients.filter(p => p.readmitted === query.readmitted);
    }

    if (query.age_range) {
      // Age range filtering (e.g., "18-30", "31-50", etc.)
      const ageParts = query.age_range.split('-').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
      if (ageParts.length === 2) {
        const minAge = ageParts[0];
        const maxAge = ageParts[1];
        if (minAge !== undefined && maxAge !== undefined) {
          filteredPatients = filteredPatients.filter(p => {
            const ageRange = p.age;
            // Handle age ranges like "[0-10)", "[10-20)", etc.
            if (ageRange.includes('-')) {
              const ageMin = parseInt(ageRange.match(/\d+/)?.[0] || '0');
              return ageMin >= minAge && ageMin <= maxAge;
            }
            return false;
          });
        }
      }
    }

    if (query.date_from || query.date_to) {
      const fromDate = query.date_from ? new Date(query.date_from) : new Date('1900-01-01');
      const toDate = query.date_to ? new Date(query.date_to) : new Date();
      
      filteredPatients = filteredPatients.filter(p => {
        if (!p.created_at) return true;
        return p.created_at >= fromDate && p.created_at <= toDate;
      });
    }

    // Apply sorting
    if (query.sort_by) {
      const sortOrder = query.sort_order === 'desc' ? -1 : 1;
      filteredPatients.sort((a, b) => {
        const aValue = (a as any)[query.sort_by!];
        const bValue = (b as any)[query.sort_by!];
        
        if (aValue < bValue) return -1 * sortOrder;
        if (aValue > bValue) return 1 * sortOrder;
        return 0;
      });
    } else {
      // Default sort by created_at descending
      filteredPatients.sort((a, b) => {
        const aDate = a.created_at || new Date(0);
        const bDate = b.created_at || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
    }

    const total = filteredPatients.length;

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    return {
      patients: paginatedPatients,
      total
    };
  }

  async update(id: string, updateData: Omit<Partial<UpdatePatientRequest>, 'id'>, userId: string): Promise<PatientRecord | null> {
    const patientIndex = this.patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return null;
    }

    const existingPatient = this.patients[patientIndex];
    if (!existingPatient) {
      return null;
    }

    // Only update fields that are provided in updateData
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        (existingPatient as any)[key] = updateData[key as keyof typeof updateData];
      }
    });

    existingPatient.updated_at = new Date();
    existingPatient.updated_by = userId;

    this.patients[patientIndex] = existingPatient;
    return existingPatient;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.patients.length;
    this.patients = this.patients.filter(p => p.id !== id);
    return this.patients.length < initialLength;
  }

  async getStats(): Promise<any> {
    const total_patients = this.patients.length;
    
    if (total_patients === 0) {
      return {
        total_patients: 0,
        by_gender: { Male: 0, Female: 0 },
        by_age_group: {},
        by_diabetes_medication: { Yes: 0, No: 0 },
        by_readmission: { YES: 0, NO: 0, ">30": 0, "<30": 0 },
        average_hospital_stay: 0,
        average_medications: 0
      };
    }

    // Gender statistics
    const by_gender = this.patients.reduce((acc, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1;
      return acc;
    }, {} as any);

    // Age group statistics
    const by_age_group = this.patients.reduce((acc, p) => {
      acc[p.age] = (acc[p.age] || 0) + 1;
      return acc;
    }, {} as any);

    // Diabetes medication statistics
    const by_diabetes_medication = this.patients.reduce((acc, p) => {
      acc[p.diabetesMed] = (acc[p.diabetesMed] || 0) + 1;
      return acc;
    }, {} as any);

    // Readmission statistics
    const by_readmission = this.patients.reduce((acc, p) => {
      if (p.readmitted) {
        acc[p.readmitted] = (acc[p.readmitted] || 0) + 1;
      }
      return acc;
    }, {} as any);

    // Average hospital stay
    const average_hospital_stay = this.patients.reduce((sum, p) => sum + p.time_in_hospital, 0) / total_patients;

    // Average medications
    const average_medications = this.patients.reduce((sum, p) => sum + p.num_medications, 0) / total_patients;

    return {
      total_patients,
      by_gender,
      by_age_group,
      by_diabetes_medication,
      by_readmission,
      average_hospital_stay: Math.round(average_hospital_stay * 100) / 100,
      average_medications: Math.round(average_medications * 100) / 100
    };
  }

  // Bulk operations
  async createMany(patientsData: CreatePatientRequest[], userId: string): Promise<PatientRecord[]> {
    const createdPatients: PatientRecord[] = [];
    
    for (const patientData of patientsData) {
      const patient = await this.create(patientData, userId);
      createdPatients.push(patient);
    }
    
    return createdPatients;
  }

  async deleteMany(ids: string[]): Promise<number> {
    const initialLength = this.patients.length;
    this.patients = this.patients.filter(p => !ids.includes(p.id!));
    return initialLength - this.patients.length;
  }

  // Import sample data
  async importSampleData(sampleData: any[]): Promise<number> {
    let imported = 0;
    
    for (const record of sampleData) {
      try {
        // Check if patient already exists
        const existing = await this.findByEncounterId(record.encounter_id);
        if (!existing) {
          const patient: PatientRecord = {
            id: crypto.randomUUID(),
            ...record,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: 'system',
            updated_by: 'system'
          };
          this.patients.push(patient);
          imported++;
        }
      } catch (error) {
        console.error(`Error importing patient record:`, error);
      }
    }
    
    return imported;
  }
}

export default new PatientModel();
