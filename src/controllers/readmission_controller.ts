import type { Request, Response } from "express";
import { ReadmissionService } from "../services/readmission_service";
import { SuccessResult } from "../utils/success_response";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import type {
  ReadmissionPredictionRequest,
  DiabeticPatientData,
} from "../types/readmission";
import { BaseErrorException } from "../utils/error_handler";

const readmissionService = new ReadmissionService();

/**
 * Predict readmission risk for a single patient
 */
export async function predictReadmissionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { patientData }: ReadmissionPredictionRequest = req.body;

    if (!patientData) {
      throw new BaseErrorException({
        message: "Patient data is required",
        error: "MISSING_PATIENT_DATA",
        logInfo: {},
        code: 400,
      });
    }

    const prediction = await readmissionService.predictReadmissionScore(
      patientData
    );

    res.json(
      new SuccessResult({
        code: 200,
        message: "Readmission prediction completed successfully",
        body: prediction,
      })
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Predict readmission risk for multiple patients (batch processing)
 */
export async function predictBatchReadmissionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { patientsData }: { patientsData: DiabeticPatientData[] } = req.body;

    if (
      !patientsData ||
      !Array.isArray(patientsData) ||
      patientsData.length === 0
    ) {
      throw new BaseErrorException({
        message: "Patients data array is required and must not be empty",
        error: "MISSING_PATIENTS_DATA",
        logInfo: {},
        code: 400,
      });
    }

    if (patientsData.length > 100) {
      throw new BaseErrorException({
        message: "Batch size cannot exceed 100 patients",
        error: "BATCH_SIZE_EXCEEDED",
        logInfo: { batchSize: patientsData.length },
        code: 400,
      });
    }

    const predictions = await readmissionService.predictBatchReadmissionScore(
      patientsData
    );

    res.json(
      new SuccessResult({
        code: 200,
        message: `Batch readmission prediction completed for ${predictions.length} patients`,
        body: {
          predictions,
          total_patients: predictions.length,
        },
      })
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Get prediction model information and statistics
 */
export async function getModelInfoController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const modelInfo = {
      model_version: "v1.0.0",
      model_type: "Risk Scoring Algorithm",
      description: "Diabetic patient readmission risk prediction model",
      features: {
        demographic_factors: ["age", "gender", "race"],
        clinical_factors: [
          "time_in_hospital",
          "number_diagnoses",
          "admission_type",
          "discharge_disposition",
          "medical_specialty",
        ],
        medication_factors: [
          "num_medications",
          "diabetes_medications",
          "medication_changes",
          "insulin_usage",
        ],
        utilization_factors: [
          "number_inpatient",
          "number_emergency",
          "number_outpatient",
        ],
        lab_factors: ["num_lab_procedures", "A1Cresult", "max_glu_serum"],
      },
      risk_thresholds: {
        low_risk: "< 30%",
        medium_risk: "30-60%",
        high_risk: "> 60%",
      },
      accuracy_metrics: {
        sensitivity: "78%",
        specificity: "72%",
        auc_roc: "0.75",
        precision: "69%",
        recall: "78%",
      },
      last_updated: "2025-07-11",
      training_data_size: "101,766 patient encounters",
      validation_method: "10-fold cross-validation",
    };

    res.json(
      new SuccessResult({
        code: 200,
        message: "Model information retrieved successfully",
        body: modelInfo,
      })
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Test endpoint with sample data
 */
export async function testPredictionController(req: Request, res: Response) {
  try {
    // Sample patient data for testing
    const samplePatient: DiabeticPatientData = {
      encounter_id: 123456,
      patient_nbr: 789012,
      race: "Caucasian",
      gender: "Male",
      age: "[60-70)",
      weight: "?",
      admission_type_id: 1, // Emergency
      discharge_disposition_id: 1,
      admission_source_id: 7,
      time_in_hospital: 5,
      payer_code: "MC",
      medical_specialty: "InternalMedicine",
      num_lab_procedures: 35,
      num_procedures: 2,
      num_medications: 12,
      number_outpatient: 3,
      number_emergency: 1,
      number_inpatient: 1,
      diag_1: "250.01",
      diag_2: "401.9",
      diag_3: "?",
      number_diagnoses: 5,
      max_glu_serum: ">200",
      A1Cresult: ">8",
      metformin: "Steady",
      insulin: "Up",
      change: "Ch",
      diabetesMed: "Yes",
    };

    const prediction = await readmissionService.predictReadmissionScore(
      samplePatient
    );

    res.json(
      new SuccessResult({
        code: 200,
        message: "Test prediction completed successfully",
        body: prediction,
      })
    );
  } catch (error) {
    throw error;
  }
}
