import type { Request, Response } from 'express';
import PatientService, { PatientError } from '../services/patient_service';
import { SuccessResult } from '../utils/success_response';
import type { CreatePatientRequest, UpdatePatientRequest, PatientListQuery } from '../types/patient';
import fs from 'fs';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

class PatientController {
  // Create a new patient
  async createPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientData: CreatePatientRequest = req.body;
      const userId = req.user?.id || 'unknown';

      const patient = await PatientService.createPatient(patientData, userId);

      res.status(201).json(
        new SuccessResult({
          code: 201,
          message: 'Patient created successfully',
          body: { patient }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get patient by ID
  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
        return;
      }

      const patient = await PatientService.getPatientById(id);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient retrieved successfully',
          body: { patient }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get patient by encounter ID
  async getPatientByEncounterId(req: Request, res: Response): Promise<void> {
    try {
      const { encounterId } = req.params;
      
      if (!encounterId) {
        res.status(400).json({
          success: false,
          message: 'Encounter ID is required'
        });
        return;
      }

      const encounterIdNum = parseInt(encounterId, 10);
      
      if (isNaN(encounterIdNum)) {
        res.status(400).json({
          success: false,
          message: 'Invalid encounter ID'
        });
        return;
      }

      const patient = await PatientService.getPatientByEncounterId(encounterIdNum);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient retrieved successfully',
          body: { patient }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get patient by patient number
  async getPatientByPatientNumber(req: Request, res: Response): Promise<void> {
    try {
      const { patientNumber } = req.params;
      
      if (!patientNumber) {
        res.status(400).json({
          success: false,
          message: 'Patient number is required'
        });
        return;
      }

      const patientNbr = parseInt(patientNumber, 10);
      
      if (isNaN(patientNbr)) {
        res.status(400).json({
          success: false,
          message: 'Invalid patient number'
        });
        return;
      }

      const patient = await PatientService.getPatientByPatientNumber(patientNbr);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient retrieved successfully',
          body: { patient }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get all patients with filtering and pagination
  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const query: PatientListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        gender: req.query.gender as string,
        age_range: req.query.age_range as string,
        diabetesMed: req.query.diabetesMed as string,
        readmitted: req.query.readmitted as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string
      };

      const result = await PatientService.getAllPatients(query);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patients retrieved successfully',
          body: result
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Update patient
  async updatePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
        return;
      }

      const updateData: Omit<Partial<UpdatePatientRequest>, 'id'> = req.body;
      const userId = req.user?.id || 'unknown';

      const patient = await PatientService.updatePatient(id, updateData, userId);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient updated successfully',
          body: { patient }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Delete patient
  async deletePatient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
        return;
      }

      await PatientService.deletePatient(id);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient deleted successfully',
          body: {}
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get patient statistics
  async getPatientStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await PatientService.getPatientStats();

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Patient statistics retrieved successfully',
          body: { stats }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Import sample data
  async importSampleData(req: Request, res: Response): Promise<void> {
    try {
      // Read sample data from file
      const sampleDataPath = path.join(process.cwd(), 'sample_data.json');
      
      if (!fs.existsSync(sampleDataPath)) {
        res.status(404).json({
          success: false,
          message: 'Sample data file not found'
        });
        return;
      }

      const sampleDataContent = fs.readFileSync(sampleDataPath, 'utf-8');
      const sampleData = JSON.parse(sampleDataContent);

      if (!Array.isArray(sampleData)) {
        res.status(400).json({
          success: false,
          message: 'Invalid sample data format'
        });
        return;
      }

      const result = await PatientService.importSampleData(sampleData);

      res.json(
        new SuccessResult({
          code: 200,
          message: 'Sample data imported successfully',
          body: {
            imported_count: result.imported,
            errors: result.errors
          }
        })
      );
    } catch (error) {
      if (error instanceof PatientError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to import sample data'
        });
      }
    }
  }
}

export default new PatientController();
