import type {
  DiabeticPatientData,
  ReadmissionPredictionResponse,
} from "../types/readmission";
import { BaseErrorException } from "../utils/error_handler";

export class ReadmissionService {
  private readonly FLASK_ML_URL = "http://localhost:8080";

  /**
   * Call Flask ML API for prediction
   */
  async predictReadmissionScore(
    patientData: DiabeticPatientData
  ): Promise<{ confidence_score: number }> {
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

      return { confidence_score };
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
  ): Promise<{ confidence_score: number }[]> {
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
