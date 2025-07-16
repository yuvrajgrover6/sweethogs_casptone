import type { Request, Response } from 'express';
import * as PatientService from '../services/patient_service';
import { BaseErrorException } from '../utils/error_handler';
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
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Get patient by ID
  async getPatientById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required',
        });
        return;
      }

      const result = await PatientService.getPatientById(id);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Get patient by encounter ID
  async getPatientByEncounterId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const encounterIdStr = req.params.encounterId;
      if (!encounterIdStr) {
        res.status(400).json({
          success: false,
          message: 'Encounter ID is required',
        });
        return;
      }

      const encounterId = parseInt(encounterIdStr);
      if (isNaN(encounterId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid encounter ID format',
        });
        return;
      }

      const result = await PatientService.getPatientByEncounterId(encounterId);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Get patient by patient number
  async getPatientByPatientNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientNbrStr = req.params.patientNumber;
      if (!patientNbrStr) {
        res.status(400).json({
          success: false,
          message: 'Patient number is required',
        });
        return;
      }

      const patientNbr = parseInt(patientNbrStr);
      if (isNaN(patientNbr)) {
        res.status(400).json({
          success: false,
          message: 'Invalid patient number format',
        });
        return;
      }

      const result = await PatientService.getPatientByPatientNumber(patientNbr);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
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
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
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
          message: 'Patient ID is required',
        });
        return;
      }

      const updateData: UpdatePatientRequest = req.body;
      const userId = req.user?.id || 'unknown';

      const result = await PatientService.updatePatient(id, updateData, userId);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Delete patient
  async deletePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Patient ID is required',
        });
        return;
      }

      const result = await PatientService.deletePatient(id);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Get patient statistics
  async getPatientStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await PatientService.getPatientStats();
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }

  // Import sample data
  async importSampleData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'system';
      const result = await PatientService.importSampleData(userId);
      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof BaseErrorException) {
        res.status(error.code).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  }
}

export default new PatientController();
