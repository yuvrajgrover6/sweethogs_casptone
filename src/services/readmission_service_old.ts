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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Flask ML API error: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      const result: ReadmissionPredictionResponse = await response.json();

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

      return await response.json();
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

  /**
   * Analyzes various risk factors for the patient
   */
  private analyzePatientRisk(data: DiabeticPatientData): ReadmissionAnalysis {
    const demographic_risk = this.calculateDemographicRisk(data);
    const clinical_risk = this.calculateClinicalRisk(data);
    const medication_risk = this.calculateMedicationRisk(data);
    const hospital_utilization_risk =
      this.calculateHospitalUtilizationRisk(data);
    const lab_test_risk = this.calculateLabTestRisk(data);

    // Weighted combination of risk factors
    const overall_risk =
      demographic_risk * 0.15 +
      clinical_risk * 0.25 +
      medication_risk * 0.2 +
      hospital_utilization_risk * 0.25 +
      lab_test_risk * 0.15;

    return {
      demographic_risk,
      clinical_risk,
      medication_risk,
      hospital_utilization_risk,
      lab_test_risk,
      overall_risk: Math.min(Math.max(overall_risk, 0), 1), // Clamp between 0-1
    };
  }

  /**
   * Calculate demographic risk factors
   */
  private calculateDemographicRisk(data: DiabeticPatientData): number {
    let risk = 0.1; // Base risk

    // Age risk (higher risk for older patients)
    const age = data.age;
    if (
      age.includes("70-80") ||
      age.includes("80-90") ||
      age.includes("90-100")
    ) {
      risk += 0.3;
    } else if (age.includes("60-70")) {
      risk += 0.2;
    } else if (age.includes("50-60")) {
      risk += 0.1;
    }

    // Gender risk (slight variation)
    if (data.gender === "Male") {
      risk += 0.05;
    }

    // Race considerations (based on diabetes prevalence)
    if (data.race === "AfricanAmerican") {
      risk += 0.1;
    } else if (data.race === "Hispanic") {
      risk += 0.08;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Calculate clinical risk factors
   */
  private calculateClinicalRisk(data: DiabeticPatientData): number {
    let risk = 0.1; // Base risk

    // Time in hospital (longer stays = higher risk)
    if (data.time_in_hospital > 7) {
      risk += 0.3;
    } else if (data.time_in_hospital > 4) {
      risk += 0.2;
    } else if (data.time_in_hospital > 2) {
      risk += 0.1;
    }

    // Number of diagnoses (comorbidities)
    if (data.number_diagnoses > 5) {
      risk += 0.2;
    } else if (data.number_diagnoses > 3) {
      risk += 0.1;
    }

    // Emergency admissions
    if (data.admission_type_id === 1) {
      // Emergency
      risk += 0.15;
    }

    // Discharge disposition
    if (data.discharge_disposition_id === 2) {
      // Transferred to another facility
      risk += 0.1;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Calculate medication-related risk
   */
  private calculateMedicationRisk(data: DiabeticPatientData): number {
    let risk = 0.1; // Base risk

    // Number of medications
    if (data.num_medications > 15) {
      risk += 0.2;
    } else if (data.num_medications > 10) {
      risk += 0.1;
    }

    // Insulin usage (higher complexity)
    if (data.insulin === "Up" || data.insulin === "Down") {
      risk += 0.15;
    }

    // Diabetes medication changes
    if (data.change === "Ch") {
      risk += 0.1;
    }

    // Multiple diabetes medications
    let diabetesMedCount = 0;
    const diabetesMeds = [
      "metformin",
      "repaglinide",
      "nateglinide",
      "chlorpropamide",
      "glimepiride",
      "acetohexamide",
      "glipizide",
      "glyburide",
      "tolbutamide",
      "pioglitazone",
      "rosiglitazone",
      "acarbose",
      "miglitol",
      "troglitazone",
      "tolazamide",
      "insulin",
    ];

    diabetesMeds.forEach((med) => {
      if (
        data[med as keyof DiabeticPatientData] === "Up" ||
        data[med as keyof DiabeticPatientData] === "Down" ||
        data[med as keyof DiabeticPatientData] === "Steady"
      ) {
        diabetesMedCount++;
      }
    });

    if (diabetesMedCount > 3) {
      risk += 0.15;
    } else if (diabetesMedCount > 1) {
      risk += 0.1;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Calculate hospital utilization risk
   */
  private calculateHospitalUtilizationRisk(data: DiabeticPatientData): number {
    let risk = 0.1; // Base risk

    // Previous inpatient visits
    if (data.number_inpatient > 2) {
      risk += 0.3;
    } else if (data.number_inpatient > 0) {
      risk += 0.2;
    }

    // Emergency visits
    if (data.number_emergency > 1) {
      risk += 0.2;
    } else if (data.number_emergency > 0) {
      risk += 0.1;
    }

    // Outpatient visits (surprisingly, very high numbers can indicate poor control)
    if (data.number_outpatient > 10) {
      risk += 0.1;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Calculate lab test related risk
   */
  private calculateLabTestRisk(data: DiabeticPatientData): number {
    let risk = 0.1; // Base risk

    // High number of lab procedures might indicate complications
    if (data.num_lab_procedures > 50) {
      risk += 0.2;
    } else if (data.num_lab_procedures > 30) {
      risk += 0.1;
    }

    // A1C results
    if (data.A1Cresult === ">8") {
      risk += 0.25; // Poor glycemic control
    } else if (data.A1Cresult === ">7") {
      risk += 0.15;
    } else if (data.A1Cresult === "Norm") {
      risk -= 0.05; // Good control reduces risk
    }

    // Glucose serum levels
    if (data.max_glu_serum === ">300") {
      risk += 0.2;
    } else if (data.max_glu_serum === ">200") {
      risk += 0.1;
    }

    return Math.min(risk, 1.0);
  }

  /**
   * Determine risk level based on confidence score
   */
  private determineRiskLevel(
    confidence_score: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    if (confidence_score < 30) {
      return "LOW";
    } else if (confidence_score < 60) {
      return "MEDIUM";
    } else {
      return "HIGH";
    }
  }

  /**
   * Identify specific risk factors for the patient
   */
  private identifyRiskFactors(
    data: DiabeticPatientData,
    analysis: ReadmissionAnalysis
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Age factor
    if (
      data.age.includes("70-80") ||
      data.age.includes("80-90") ||
      data.age.includes("90-100")
    ) {
      factors.push({
        factor: "Advanced Age",
        impact: "NEGATIVE",
        weight: 0.3,
        description:
          "Patients over 70 have increased readmission risk due to multiple comorbidities",
      });
    }

    // Hospital stay length
    if (data.time_in_hospital > 7) {
      factors.push({
        factor: "Extended Hospital Stay",
        impact: "NEGATIVE",
        weight: 0.3,
        description:
          "Hospital stays longer than 7 days indicate complex medical conditions",
      });
    }

    // Previous admissions
    if (data.number_inpatient > 0) {
      factors.push({
        factor: "Previous Hospitalizations",
        impact: "NEGATIVE",
        weight: 0.2,
        description:
          "History of inpatient admissions increases readmission likelihood",
      });
    }

    // A1C levels
    if (data.A1Cresult === ">8") {
      factors.push({
        factor: "Poor Glycemic Control",
        impact: "NEGATIVE",
        weight: 0.25,
        description: "HbA1c >8% indicates poor diabetes management",
      });
    } else if (data.A1Cresult === "Norm") {
      factors.push({
        factor: "Good Glycemic Control",
        impact: "POSITIVE",
        weight: 0.15,
        description: "Normal HbA1c levels indicate good diabetes management",
      });
    }

    // Medication changes
    if (data.change === "Ch") {
      factors.push({
        factor: "Medication Changes",
        impact: "NEGATIVE",
        weight: 0.1,
        description:
          "Recent medication changes may indicate treatment adjustments",
      });
    }

    // Emergency admission
    if (data.admission_type_id === 1) {
      factors.push({
        factor: "Emergency Admission",
        impact: "NEGATIVE",
        weight: 0.15,
        description: "Emergency admissions often indicate acute medical issues",
      });
    }

    return factors;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    risk_level: string,
    risk_factors: RiskFactor[]
  ): string[] {
    const recommendations: string[] = [];

    if (risk_level === "HIGH") {
      recommendations.push(
        "Schedule follow-up appointment within 7 days of discharge"
      );
      recommendations.push(
        "Implement intensive care coordination and case management"
      );
      recommendations.push(
        "Consider telehealth monitoring for vital signs and glucose levels"
      );
    } else if (risk_level === "MEDIUM") {
      recommendations.push(
        "Schedule follow-up appointment within 14 days of discharge"
      );
      recommendations.push("Provide comprehensive discharge education");
    } else {
      recommendations.push(
        "Schedule routine follow-up appointment within 30 days"
      );
    }

    // Specific recommendations based on risk factors
    const hasGlycemicControl = risk_factors.some(
      (f) => f.factor === "Poor Glycemic Control"
    );
    if (hasGlycemicControl) {
      recommendations.push(
        "Refer to diabetes educator for glycemic control optimization"
      );
      recommendations.push("Consider continuous glucose monitoring");
    }

    const hasMedicationChanges = risk_factors.some(
      (f) => f.factor === "Medication Changes"
    );
    if (hasMedicationChanges) {
      recommendations.push(
        "Conduct medication reconciliation and adherence counseling"
      );
    }

    const hasEmergencyAdmission = risk_factors.some(
      (f) => f.factor === "Emergency Admission"
    );
    if (hasEmergencyAdmission) {
      recommendations.push(
        "Develop emergency action plan for diabetes management"
      );
    }

    // Always include general recommendations
    recommendations.push(
      "Ensure patient has adequate diabetes supplies and medications"
    );
    recommendations.push(
      "Provide emergency contact information for diabetes-related concerns"
    );

    return recommendations;
  }

  /**
   * Batch prediction for multiple patients (scores only)
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
   * Batch prediction for multiple patients
   */
  async predictBatchReadmission(
    patientsData: DiabeticPatientData[]
  ): Promise<ReadmissionPredictionResponse[]> {
    try {
      const predictions = await Promise.all(
        patientsData.map((patientData) => this.predictReadmission(patientData))
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
}
