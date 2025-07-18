import type { Request, Response } from 'express';
import * as PatientService from '../services/patient_service';
import { basicErrorResults } from '../utils/error_handler';
import type { CreatePatientRequest, UpdatePatientRequest, PatientListQuery } from '../types/patient';

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

      const result = await PatientService.createPatient(patientData, userId);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to create patient");
      res.status(err.code).json(err);
    }
  }

  // Get patient by ID
  async getPatientById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const err = basicErrorResults(new Error("Patient ID is required"), "Invalid patient ID");
        res.status(err.code).json(err);
        return;
      }

      const result = await PatientService.getPatientById(id);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to retrieve patient");
      res.status(err.code).json(err);
    }
  }

  // Get patient by encounter ID
  async getPatientByEncounterId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const encounterIdStr = req.params.encounterId;
      if (!encounterIdStr) {
        const err = basicErrorResults(new Error("Encounter ID is required"), "Invalid encounter ID");
        res.status(err.code).json(err);
        return;
      }

      const encounterId = parseInt(encounterIdStr);
      if (isNaN(encounterId)) {
        const err = basicErrorResults(new Error("Invalid encounter ID format"), "Invalid encounter ID");
        res.status(err.code).json(err);
        return;
      }

      const result = await PatientService.getPatientByEncounterId(encounterId);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to retrieve patient");
      res.status(err.code).json(err);
    }
  }

  // Get patient by patient number
  async getPatientByPatientNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientNbrStr = req.params.patientNumber;
      if (!patientNbrStr) {
        const err = basicErrorResults(new Error("Patient number is required"), "Invalid patient number");
        res.status(err.code).json(err);
        return;
      }

      const patientNbr = parseInt(patientNbrStr);
      if (isNaN(patientNbr)) {
        const err = basicErrorResults(new Error("Invalid patient number format"), "Invalid patient number");
        res.status(err.code).json(err);
        return;
      }

      const result = await PatientService.getPatientByPatientNumber(patientNbr);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to retrieve patient");
      res.status(err.code).json(err);
    }
  }

  // Get all patients with filtering and pagination
  async getAllPatients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: PatientListQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 10,
        search: req.query.search as string,
        gender: req.query.gender as string,
        age_range: req.query.age_range as string,
        diabetesMed: req.query.diabetesMed as string,
        readmitted: req.query.readmitted as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
      };

      const result = await PatientService.getAllPatients(query);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to retrieve patients");
      res.status(err.code).json(err);
    }
  }

  // Update patient
  async updatePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const err = basicErrorResults(new Error("Patient ID is required"), "Invalid patient ID");
        res.status(err.code).json(err);
        return;
      }

      const updateData: UpdatePatientRequest = req.body;
      const userId = req.user?.id || 'unknown';

      const result = await PatientService.updatePatient(id, updateData, userId);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to update patient");
      res.status(err.code).json(err);
    }
  }

  // Delete patient
  async deletePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const err = basicErrorResults(new Error("Patient ID is required"), "Invalid patient ID");
        res.status(err.code).json(err);
        return;
      }

      const result = await PatientService.deletePatient(id);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to delete patient");
      res.status(err.code).json(err);
    }
  }

  // Get patient statistics
  async getPatientStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await PatientService.getPatientStats();
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to retrieve patient statistics");
      res.status(err.code).json(err);
    }
  }

  // Get patient analytics for charts and graphs
  async getPatientAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('Analytics controller method called');
      const result = await PatientService.getPatientAnalytics();
      console.log('Analytics result:', result);
      res.status(result.code).json(result);
    } catch (error) {
      console.log('Analytics controller error:', error);
      const err = basicErrorResults(error, "Failed to retrieve patient analytics");
      res.status(err.code).json(err);
    }
  }

  // Import sample data
  async importSampleData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const result = await PatientService.importSampleData(userId);
      res.status(result.code).json(result);
    } catch (error) {
      const err = basicErrorResults(error, "Failed to import sample data");
      res.status(err.code).json(err);
    }
  }
}

export default new PatientController();
