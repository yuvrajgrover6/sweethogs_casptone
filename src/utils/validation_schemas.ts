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

// Diabetic patient data validation schema (matching Flask ML API)
export const diabeticPatientSchema = {
  type: "object",
  properties: {
    // Required parameters
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
    gender: {
      type: "string",
      enum: ["Male", "Female"],
    },
    time_in_hospital: {
      type: "number",
      minimum: 1,
      maximum: 14,
    },
    admission_type: {
      type: "number",
      minimum: 1,
      maximum: 8,
    },
    discharge_disposition: {
      type: "number",
      minimum: 1,
      maximum: 30,
    },
    admission_source: {
      type: "number",
      minimum: 1,
      maximum: 26,
    },
    num_medications: {
      type: "number",
      minimum: 0,
      maximum: 81,
    },
    num_lab_procedures: {
      type: "number",
      minimum: 0,
      maximum: 132,
    },
    num_procedures: {
      type: "number",
      minimum: 0,
      maximum: 6,
    },
    number_diagnoses: {
      type: "number",
      minimum: 1,
      maximum: 16,
    },
    number_inpatient: {
      type: "number",
      minimum: 0,
      maximum: 21,
    },
    number_outpatient: {
      type: "number",
      minimum: 0,
      maximum: 42,
    },
    number_emergency: {
      type: "number",
      minimum: 0,
      maximum: 76,
    },
    diabetesMed: {
      type: "string",
      enum: ["Yes", "No"],
    },
    change: {
      type: "string",
      enum: ["No", "Ch"],
    },
    A1Cresult: {
      type: "string",
      enum: [">7", ">8", "Norm", "None"],
    },
    max_glu_serum: {
      type: "string",
      enum: [">200", ">300", "Norm", "None"],
    },
    insulin: {
      type: "string",
      enum: ["Down", "Steady", "Up", "No"],
    },
    metformin: {
      type: "string",
      enum: ["Down", "Steady", "Up", "No"],
    },
    diagnosis_1: {
      type: "string",
      minLength: 1,
    },
  },
  required: [
    "age",
    "gender",
    "time_in_hospital",
    "admission_type",
    "discharge_disposition",
    "admission_source",
    "num_medications",
    "num_lab_procedures",
    "num_procedures",
    "number_diagnoses",
    "number_inpatient",
    "number_outpatient",
    "number_emergency",
    "diabetesMed",
    "change",
    "A1Cresult",
    "max_glu_serum",
    "insulin",
    "metformin",
    "diagnosis_1",
  ],
  additionalProperties: false,
};

export const readmissionPredictionSchema = {
  type: "object",
  properties: diabeticPatientSchema.properties,
  required: diabeticPatientSchema.required,
  additionalProperties: false,
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
  additionalProperties: false,
};
