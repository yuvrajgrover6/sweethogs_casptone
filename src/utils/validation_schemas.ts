export const AuthValidationSchemas = {
  register: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        maxLength: 255,
      },
      password: {
        type: "string",
        minLength: 6,
        maxLength: 128,
      },
      firstName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      lastName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      avatar: {
        type: "string",
        pattern: "^https?:\\/\\/.+\\.(jpg|jpeg|png|gif|webp)$",
      },
      phoneNumber: {
        type: "string",
        pattern: "^\\+?[\\d\\s\\-\\(\\)]{10,}$",
      },
      dateOfBirth: {
        type: "string",
        format: "date",
      },
      role: {
        type: "string",
        enum: ["user", "admin"],
      },
    },
    required: ["email", "password"],
    additionalProperties: false,
  },

  login: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        maxLength: 255,
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 128,
      },
    },
    required: ["email", "password"],
    additionalProperties: false,
  },

  refreshToken: {
    type: "object",
    properties: {
      refreshToken: {
        type: "string",
        minLength: 1,
      },
    },
    required: ["refreshToken"],
    additionalProperties: false,
  },

  changePassword: {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        minLength: 1,
        maxLength: 128,
      },
      newPassword: {
        type: "string",
        minLength: 6,
        maxLength: 128,
      },
    },
    required: ["currentPassword", "newPassword"],
    additionalProperties: false,
  },

  updateProfile: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        maxLength: 255,
      },
      firstName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      lastName: {
        type: "string",
        minLength: 1,
        maxLength: 50,
      },
      avatar: {
        type: "string",
        pattern: "^https?:\\/\\/.+\\.(jpg|jpeg|png|gif|webp)$",
      },
      phoneNumber: {
        type: "string",
        pattern: "^\\+?[\\d\\s\\-\\(\\)]{10,}$",
      },
      dateOfBirth: {
        type: "string",
        format: "date",
      },
    },
    additionalProperties: false,
  },
};

// Diabetic patient data validation schema
export const diabeticPatientSchema = {
  type: "object",
  properties: {
    encounter_id: {
      type: "number",
      minimum: 1,
    },
    patient_nbr: {
      type: "number",
      minimum: 1,
    },
    race: {
      type: "string",
      enum: ["Caucasian", "AfricanAmerican", "Asian", "Hispanic", "Other", "?"],
    },
    gender: {
      type: "string",
      enum: ["Male", "Female", "Unknown/Invalid"],
    },
    age: {
      type: "string",
      enum: [
        "[0-10)",
        "[10-20)",
        "[20-30)",
        "[30-40)",
        "[40-50)",
        "[50-60)",
        "[60-70)",
        "[70-80)",
        "[80-90)",
        "[90-100)",
      ],
    },
    weight: {
      type: "string",
      default: "?",
    },
    admission_type_id: {
      type: "number",
      minimum: 1,
      maximum: 8,
    },
    discharge_disposition_id: {
      type: "number",
      minimum: 1,
    },
    admission_source_id: {
      type: "number",
      minimum: 1,
    },
    time_in_hospital: {
      type: "number",
      minimum: 1,
      maximum: 14,
    },
    payer_code: {
      type: "string",
    },
    medical_specialty: {
      type: "string",
    },
    num_lab_procedures: {
      type: "number",
      minimum: 0,
    },
    num_procedures: {
      type: "number",
      minimum: 0,
    },
    num_medications: {
      type: "number",
      minimum: 0,
    },
    number_outpatient: {
      type: "number",
      minimum: 0,
    },
    number_emergency: {
      type: "number",
      minimum: 0,
    },
    number_inpatient: {
      type: "number",
      minimum: 0,
    },
    diag_1: {
      type: "string",
      minLength: 1,
    },
    diag_2: {
      type: "string",
    },
    diag_3: {
      type: "string",
    },
    number_diagnoses: {
      type: "number",
      minimum: 1,
    },
    max_glu_serum: {
      type: "string",
      enum: ["None", "Norm", ">200", ">300", "?"],
    },
    A1Cresult: {
      type: "string",
      enum: ["None", "Norm", ">7", ">8", "?"],
    },
    metformin: {
      type: "string",
      enum: ["No", "Steady", "Up", "Down"],
      default: "No",
    },
    insulin: {
      type: "string",
      enum: ["No", "Steady", "Up", "Down"],
      default: "No",
    },
    change: {
      type: "string",
      enum: ["No", "Ch"],
      default: "No",
    },
    diabetesMed: {
      type: "string",
      enum: ["Yes", "No"],
    },
  },
  required: [
    "encounter_id",
    "patient_nbr",
    "race",
    "gender",
    "age",
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "diag_1",
    "number_diagnoses",
    "max_glu_serum",
    "A1Cresult",
    "diabetesMed",
  ],
  additionalProperties: true,
};

export const readmissionPredictionSchema = {
  type: "object",
  properties: {
    patientData: diabeticPatientSchema,
  },
  required: ["patientData"],
  additionalProperties: true,
};

export const batchReadmissionPredictionSchema = {
  type: "object",
  properties: {
    patientsData: {
      type: "array",
      items: diabeticPatientSchema,
      minItems: 1,
      maxItems: 100,
    },
  },
  required: ["patientsData"],
  additionalProperties: true,
};
