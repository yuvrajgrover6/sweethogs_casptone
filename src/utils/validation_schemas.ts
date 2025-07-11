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
