import PDFDocument from 'pdfkit';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DiabeticPatientData } from '../types/readmission';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ReportData {
  patientData: DiabeticPatientData;
  confidenceScore: number;
  remedy: string;
}

export class PDFReportService {
  private readonly HUMBER_BLUE = '#2C5282';
  private readonly DARK_GRAY = '#2D3748';
  private readonly LIGHT_GRAY = '#4A5568';
  private readonly RED = '#E53E3E';
  private readonly YELLOW = '#ECC94B';
  private readonly GREEN = '#38A169';
  private readonly LIGHT_BLUE_BG = '#F0F8FF';
  private readonly TABLE_GRAY = '#F7FAFC';
  private readonly BORDER_GRAY = '#E2E8F0';
  
  private readonly PAGE_WIDTH = 612;
  private readonly PAGE_HEIGHT = 792;
  private readonly MARGIN = 72;
  private readonly USABLE_WIDTH = this.PAGE_WIDTH - (2 * this.MARGIN);

  /**
   * Generate a medical report PDF matching Python ReportLab quality
   */
  async generateMedicalReport(reportData: ReportData): Promise<Buffer> {
    const { patientData, confidenceScore, remedy } = reportData;
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: this.MARGIN,
          size: 'letter',
          info: {
            Title: 'Medical Readmission Risk Assessment Report',
            Author: 'SweatHogs Medical AI System',
            Subject: 'Readmission Risk Assessment',
            Creator: 'Humber College Capstone Project'
          }
        });
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        
        // Generate the report content like Python version
        this.generatePythonStyleReport(doc, patientData, confidenceScore, remedy);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private generatePythonStyleReport(
    doc: PDFKit.PDFDocument, 
    patientData: DiabeticPatientData, 
    confidenceScore: number, 
    remedy: string
  ): void {
    // Page 1: Header, Institution, Patient Info, Risk Assessment
    this.addReportTitle(doc);
    this.addInstitutionSection(doc);
    this.addReportDate(doc);
    this.addPatientInfoTable(doc, patientData);
    this.addRiskAssessmentBox(doc, confidenceScore);
    
    // Always add new page after first page content
    doc.addPage();
    
    // Page 2: Chart, Insights, Explanation, Disclaimer, Footer
    this.addRiskVisualizationChart(doc, confidenceScore);
    this.addMedicalInsightsBox(doc, remedy);
    this.addRiskEducationSection(doc);
    this.addMedicalDisclaimer(doc);
    this.addReportFooter(doc);
  }

  private addReportTitle(doc: PDFKit.PDFDocument): void {
    doc.fontSize(20) // Reduced from 24 to 20
       .fillColor(this.HUMBER_BLUE)
       .font('Helvetica-Bold')
       .text('Medical Readmission Risk Assessment Report', this.MARGIN, 80, {
         align: 'center',
         width: this.USABLE_WIDTH
       });
    
    doc.y += 25; // Reduced from 30 to 25
  }

  private addInstitutionSection(doc: PDFKit.PDFDocument): void {
    doc.fontSize(10) // Reduced from 11 to 10
       .fillColor(this.HUMBER_BLUE)
       .font('Helvetica-Bold');
    
    const institutionText = [
      'Humber College Institute of Technology & Advanced Learning',
      'Capstone Project - Computer Programming',
      'Team SweatHogs: Gurmat Singh Sour, Yuvraj Grover, Minh Nhat Mai, Robert Seibel, Mohammed Hasnain Ali'
    ];
    
    institutionText.forEach((line, index) => {
      doc.text(line, this.MARGIN, doc.y, {
        align: 'center',
        width: this.USABLE_WIDTH
      });
      if (index < institutionText.length - 1) {
        doc.y += 10; // Reduced from 12 to 10
      }
    });
    
    doc.y += 18; // Reduced from 20 to 18
  }

  private addReportDate(doc: PDFKit.PDFDocument): void {
    const reportDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    doc.fontSize(10) // Reduced from 11 to 10
       .fillColor('black')
       .font('Helvetica-Bold')
       .text('Generated: ', this.MARGIN, doc.y, { continued: true })
       .font('Helvetica')
       .text(reportDate);
    
    doc.y += 12; // Reduced from 15 to 12
  }

  private addPatientInfoTable(doc: PDFKit.PDFDocument, patientData: DiabeticPatientData): void {
    // Section header
    doc.fontSize(14) // Reduced from 16 to 14
       .fillColor(this.DARK_GRAY)
       .font('Helvetica-Bold')
       .text('Patient Information', this.MARGIN, doc.y);
    
    doc.y += 10; // Reduced from 12 to 10
    
    // Create ReportLab-style table
    this.createReportLabTable(doc, patientData);
    
    doc.y += 12; // Reduced from 15 to 12
  }

  private createReportLabTable(doc: PDFKit.PDFDocument, patientData: DiabeticPatientData): void {
    const tableData = this.formatPatientDataForReportLab(patientData);
    const startY = doc.y;
    const colWidth = this.USABLE_WIDTH / 2;
    const rowHeight = 18; // Reduced from 25 to 18
    const padding = 8; // Reduced from 10 to 8
    
    // Table header with blue background
    doc.rect(this.MARGIN, startY, this.USABLE_WIDTH, rowHeight)
       .fill(this.HUMBER_BLUE);
    
    // Header text in white
    doc.fontSize(10) // Reduced from 11 to 10
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('Field', this.MARGIN + padding, startY + 6, { width: colWidth - (2 * padding) })
       .text('Value', this.MARGIN + colWidth + padding, startY + 6, { width: colWidth - (2 * padding) });
    
    let currentY = startY + rowHeight;
    
    // Table rows with alternating colors
    tableData.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? 'white' : this.TABLE_GRAY;
      
      // Row background
      doc.rect(this.MARGIN, currentY, this.USABLE_WIDTH, rowHeight)
         .fill(bgColor);
      
      // Cell borders
      doc.rect(this.MARGIN, currentY, colWidth, rowHeight)
         .stroke(this.BORDER_GRAY);
      doc.rect(this.MARGIN + colWidth, currentY, colWidth, rowHeight)
         .stroke(this.BORDER_GRAY);
      
      // Cell content
      doc.fontSize(9) // Reduced from 10 to 9
         .fillColor('black')
         .font('Helvetica-Bold')
         .text(row.field, this.MARGIN + padding, currentY + 5, { 
           width: colWidth - (2 * padding), 
           align: 'left' 
         });
      
      doc.font('Helvetica')
         .text(row.value, this.MARGIN + colWidth + padding, currentY + 5, { 
           width: colWidth - (2 * padding), 
           align: 'left' 
         });
      
      currentY += rowHeight;
    });
    
    // Outer table border
    doc.rect(this.MARGIN, startY, this.USABLE_WIDTH, currentY - startY)
       .stroke(this.BORDER_GRAY);
    
    doc.y = currentY;
  }

  private addRiskAssessmentBox(doc: PDFKit.PDFDocument, confidenceScore: number): void {
    // Section header
    doc.fontSize(16)
       .fillColor(this.DARK_GRAY)
       .font('Helvetica-Bold')
       .text('Risk Assessment Results', this.MARGIN, doc.y);
    
    doc.y += 12; // Reduced from 15 to 12
    
    const riskLevel = confidenceScore >= 0.7 ? 'High' : confidenceScore >= 0.3 ? 'Medium' : 'Low';
    const riskColor = confidenceScore >= 0.7 ? this.RED : confidenceScore >= 0.3 ? this.YELLOW : this.GREEN;
    
    // Risk assessment box with border
    const boxY = doc.y;
    const boxHeight = 70; // Reduced from 90 to 70
    
    doc.rect(this.MARGIN, boxY, this.USABLE_WIDTH, boxHeight)
       .fill('#F8F9FA')
       .stroke(this.BORDER_GRAY);
    
    // Content with proper spacing
    const contentX = this.MARGIN + 20;
    const contentWidth = this.USABLE_WIDTH - 40;
    
    doc.fontSize(11) // Reduced from 12 to 11
       .fillColor('black')
       .font('Helvetica-Bold')
       .text('Readmission Risk Score: ', contentX, boxY + 12, { continued: true })
       .font('Helvetica')
       .text(confidenceScore.toFixed(3));
    
    doc.font('Helvetica-Bold')
       .text('Risk Level: ', contentX, boxY + 28, { continued: true })
       .fillColor(riskColor)
       .font('Helvetica-Bold')
       .text(`${riskLevel} Risk`);
    
    doc.fillColor('black')
       .font('Helvetica-Bold')
       .text('Model Confidence: ', contentX, boxY + 44, { continued: true })
       .font('Helvetica')
       .text(`${(confidenceScore * 100).toFixed(1)}%`);
    
    doc.y = boxY + boxHeight + 10; // Reduced from 15 to 10
  }

  private addRiskVisualizationChart(doc: PDFKit.PDFDocument, confidenceScore: number): void {
    // Add new page if needed
    if (doc.y > 500) {
      doc.addPage();
    }
    
    // Section header
    doc.fontSize(16)
       .fillColor(this.DARK_GRAY)
       .font('Helvetica-Bold')
       .text('Risk Assessment Visualization', this.MARGIN, doc.y);
    
    doc.y += 20; // Increased from 20 to 30 for more space
    
    // Create professional chart matching Python quality
    const chartBuffer = this.createProfessionalReportLabChart(confidenceScore);
    const chartWidth = 400;
    const chartHeight = 250;
    
    // Center the chart
    const chartX = (this.PAGE_WIDTH - chartWidth) / 2;
    
    doc.image(chartBuffer, chartX, doc.y, { width: chartWidth, height: chartHeight });
    doc.y += chartHeight + 20;
  }

  private createProfessionalReportLabChart(confidenceScore: number): Buffer {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Clean white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 400);
    
    // Chart dimensions matching ReportLab style
    const chartX = 80;
    const chartY = 100;
    const chartWidth = 440;
    const chartHeight = 200;
    
    // Title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Readmission Risk Assessment', 300, 30);

    // Risk category bars
    const categories = [
      { label: 'Low Risk', range: '(0.0-0.3)', color: this.GREEN, start: 0, end: 0.3 },
      { label: 'Medium Risk', range: '(0.3-0.7)', color: this.YELLOW, start: 0.3, end: 0.7 },
      { label: 'High Risk', range: '(0.7-1.0)', color: this.RED, start: 0.7, end: 1.0 }
    ];
    
    const barWidth = 120;
    const barSpacing = 20;
    
    categories.forEach((category, index) => {
      const x = chartX + (index * (barWidth + barSpacing));
      const height = chartHeight * (category.end - category.start);
      const y = chartY + chartHeight - height;
      
      // Determine if this is the active category
      const isActive = confidenceScore >= category.start && confidenceScore < category.end;
      
      // Bar with proper styling
      ctx.fillStyle = isActive ? category.color : category.color + '60';
      ctx.fillRect(x, y, barWidth, height);
      
      // Bar border
      ctx.strokeStyle = isActive ? '#000' : '#666';
      ctx.lineWidth = isActive ? 3 : 1;
      ctx.strokeRect(x, y, barWidth, height);
      
      // Labels below bars
      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(category.label, x + barWidth/2, chartY + chartHeight + 25);
      
      ctx.font = '10px Arial';
      ctx.fillText(category.range, x + barWidth/2, chartY + chartHeight + 40);
    });
    
    // Patient score indicator line
    const scoreX = chartX + (confidenceScore * chartWidth);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(scoreX, chartY - 20);
    ctx.lineTo(scoreX, chartY + chartHeight + 15);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Score label
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Patient Score: ${confidenceScore.toFixed(3)}`, scoreX, chartY - 25);
    
    // Y-axis scale
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666';
    for (let i = 0; i <= 10; i++) {
      const value = i / 10;
      const y = chartY + chartHeight - (value * chartHeight);
      ctx.fillText(value.toFixed(1), chartX - 10, y + 3);
      
      // Grid lines
      if (i > 0 && i < 10) {
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartX, y);
        ctx.lineTo(chartX + chartWidth, y);
        ctx.stroke();
      }
    }
    
    // Chart axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartHeight);
    ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
    ctx.stroke();
    
    return canvas.toBuffer('image/png');
  }

  private addMedicalInsightsBox(doc: PDFKit.PDFDocument, remedy: string): void {
    // Section header
    doc.fontSize(16)
       .fillColor(this.DARK_GRAY)
       .font('Helvetica-Bold')
       .text('AI-Generated Medical Insights', this.MARGIN, doc.y);
    
    doc.y += 15;
    
    // Calculate text height for proper box sizing
    doc.fontSize(11).font('Helvetica');
    const textHeight = doc.heightOfString(remedy, { 
      width: this.USABLE_WIDTH - 40,
      align: 'justify'
    });
    const boxHeight = textHeight + 30;
    
    // Insights box with light blue background
    const boxY = doc.y;
    doc.rect(this.MARGIN, boxY, this.USABLE_WIDTH, boxHeight)
       .fill(this.LIGHT_BLUE_BG)
       .stroke('#B8D4F0');
    
    // Content with proper margins
    doc.fillColor('black')
       .text(remedy, this.MARGIN + 20, boxY + 15, {
         width: this.USABLE_WIDTH - 40,
         align: 'justify'
       });
    
    doc.y = boxY + boxHeight + 20;
  }

  private addRiskEducationSection(doc: PDFKit.PDFDocument): void {
    // Section header
    doc.fontSize(16)
       .fillColor(this.DARK_GRAY)
       .font('Helvetica-Bold')
       .text('Understanding Your Risk Score', this.MARGIN, doc.y);
    
    doc.y += 15;
    
    const explanationText = `The readmission risk score is calculated using advanced machine learning algorithms that analyze multiple patient factors including medical history, current medications, diagnosis codes, hospital stay characteristics, and previous healthcare utilization patterns.

Risk Categories:
• Low Risk (0.0-0.3): Minimal likelihood of readmission
• Medium Risk (0.3-0.7): Moderate readmission risk requiring attention
• High Risk (0.7-1.0): Elevated readmission risk requiring intensive follow-up`;
    
    doc.fontSize(11)
       .fillColor('black')
       .font('Helvetica')
       .text(explanationText, this.MARGIN, doc.y, {
         width: this.USABLE_WIDTH,
         align: 'justify'
       });
    
    doc.y += 30;
  }

  private addMedicalDisclaimer(doc: PDFKit.PDFDocument): void {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }
    
    const boxHeight = 80;
    const boxY = doc.y;
    
    // Red disclaimer box
    doc.rect(this.MARGIN, boxY, this.USABLE_WIDTH, boxHeight)
       .fill('#FFF5F5')
       .stroke(this.RED);
    
    // Disclaimer header
    doc.fontSize(11)
       .fillColor(this.RED)
       .font('Helvetica-Bold')
       .text('IMPORTANT MEDICAL DISCLAIMER', this.MARGIN + 20, boxY + 10, {
         width: this.USABLE_WIDTH - 40,
         align: 'center'
       });
    
    // Disclaimer text
    doc.fontSize(9)
       .font('Helvetica')
       .text('This report is generated by an AI system for informational purposes only and should not be considered medical advice, diagnosis, or treatment recommendations. Always consult with qualified healthcare professionals for medical decisions.', 
             this.MARGIN + 20, boxY + 30, {
         width: this.USABLE_WIDTH - 40,
         align: 'center'
       });
    
    doc.y = boxY + boxHeight + 20;
  }

  private addReportFooter(doc: PDFKit.PDFDocument): void {
    const footerLines = [
      'Generated by SweatHogs Medical AI Prediction System',
      'Humber College Capstone Project | Computer Programming Program',
      'Team Members: Gurmat Singh, Yuvraj Grover, Minh Nhat Mai, Robert Seibel, Mohammed Hasnain Ali'
    ];
    
    doc.fontSize(10)
       .fillColor(this.LIGHT_GRAY)
       .font('Helvetica');
    
    footerLines.forEach((line, index) => {
      doc.text(line, this.MARGIN, doc.y, {
         width: this.USABLE_WIDTH,
         align: 'center'
       });
      if (index < footerLines.length - 1) {
         doc.y += 12;
      }
    });
  }

  private formatPatientDataForReportLab(patientData: DiabeticPatientData): Array<{field: string, value: string}> {
    // Only include the most important fields to keep table compact
    const fieldMappings: Record<string, string> = {
      age: 'Age Group',
      gender: 'Gender',
      time_in_hospital: 'Time in Hospital (days)',
      admission_type: 'Admission Type',
      discharge_disposition: 'Discharge Disposition',
      num_medications: 'Number of Medications',
      num_lab_procedures: 'Lab Procedures',
      number_diagnoses: 'Number of Diagnoses',
      number_inpatient: 'Previous Inpatient Visits',
      number_outpatient: 'Previous Outpatient Visits',
      number_emergency: 'Previous Emergency Visits',
      diabetesMed: 'Diabetes Medication',
      A1Cresult: 'A1C Test Result',
      insulin: 'Insulin',
      metformin: 'Metformin'
    };

    return Object.entries(patientData)
      .filter(([key]) => fieldMappings[key])
      .map(([key, value]) => ({
        field: fieldMappings[key]!,
        value: value?.toString() || 'N/A'
      }));
  }
}
