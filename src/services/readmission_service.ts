import type {
  DiabeticPatientData,
  ReadmissionPredictionResponse,
} from "../types/readmission";
import type { IPatient } from "../models/patient_model";
import { BaseErrorException } from "../utils/error_handler";

export class ReadmissionService {
  private readonly FLASK_ML_URL = "http://localhost:8080";

  /**
   * Convert patient model data to ML API format
   */
  private mapPatientToMLFormat(patient: IPatient): DiabeticPatientData {
    return {
      age: patient.age,
      gender: patient.gender,
      time_in_hospital: patient.time_in_hospital,
      admission_type: patient.admission_type_id, // Map field name
      discharge_disposition: patient.discharge_disposition_id, // Map field name
      admission_source: patient.admission_source_id, // Map field name
      num_medications: patient.num_medications,
      num_lab_procedures: patient.num_lab_procedures,
      num_procedures: patient.num_procedures,
      number_diagnoses: patient.number_diagnoses,
      number_inpatient: patient.number_inpatient,
      number_outpatient: patient.number_outpatient,
      number_emergency: patient.number_emergency,
      diabetesMed: patient.diabetesMed,
      change: patient.change,
      A1Cresult: patient.A1Cresult,
      max_glu_serum: patient.max_glu_serum,
      insulin: patient.insulin,
      metformin: patient.metformin,
      diagnosis_1: patient.diag_1, // Map field name
    };
  }

  /**
   * Predict readmission for a patient record from database
   */
  async predictReadmissionForPatient(patient: IPatient): Promise<{ confidence_score: number; remedy?: string | null }> {
    const mlData = this.mapPatientToMLFormat(patient);
    return this.predictReadmissionScore(mlData);
  }

  /**
   * Call Flask ML API for prediction
   */
  async predictReadmissionScore(
    patientData: DiabeticPatientData
  ): Promise<{ confidence_score: number; remedy?: string | null }> {
    try {
      const response = await fetch(`${this.FLASK_ML_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(
          `Flask ML API error: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      const result = await response.json() as ReadmissionPredictionResponse;

      if (result.status === "error") {
        throw new Error(result.error || "Unknown ML API error");
      }

      // Convert confidence score from 0-1 range to 0-100 range
      const confidence_score = Math.round((result.confidence_score || 0) * 100);

      // Include remedy if provided by Flask ML API
      const predictionResult: { confidence_score: number; remedy?: string | null } = { confidence_score };
      
      if (result.remedy !== undefined) {
        predictionResult.remedy = result.remedy;
      }

      return predictionResult;
    } catch (error) {
      console.error("Flask ML API error:", error);
      throw new BaseErrorException({
        message: "Failed to predict readmission risk",
        error: "READMISSION_PREDICTION_FAILED",
        logInfo: { error: error instanceof Error ? error.message : error, patientData },
        code: 500,
      });
    }
  }

  /**
   * Batch prediction for multiple patients
   */
  async predictBatchReadmissionScore(
    patientsData: DiabeticPatientData[]
  ): Promise<{ confidence_score: number; remedy?: string | null }[]> {
    try {
      const predictions = await Promise.all(
        patientsData.map((patientData) =>
          this.predictReadmissionScore(patientData)
        )
      );
      return predictions;
    } catch (error) {
      throw new BaseErrorException({
        message: "Failed to process batch prediction",
        error: "BATCH_PREDICTION_FAILED",
        logInfo: { error, batchSize: patientsData.length },
        code: 500,
      });
    }
  }

  /**
   * Check Flask ML API health
   */
  async checkMLServiceHealth(): Promise<{ status: string; model_loaded: boolean }> {
    try {
      const response = await fetch(`${this.FLASK_ML_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json() as { status: string; model_loaded: boolean };
    } catch (error) {
      console.error("ML Service health check failed:", error);
      throw new BaseErrorException({
        message: "ML service health check failed",
        error: "ML_SERVICE_UNAVAILABLE", 
        logInfo: { error: error instanceof Error ? error.message : error },
        code: 503,
      });
    }
  }
}
