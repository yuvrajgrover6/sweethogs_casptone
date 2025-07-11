import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { config } from "../config/config";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  role: "user" | "admin";
  isActive: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Avatar must be a valid image URL",
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v: Date) {
          return !v || v < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add refresh token
UserSchema.methods.addRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshTokens.push(token);
  await this.save();
};

// Remove refresh token
UserSchema.methods.removeRefreshToken = async function (
  token: string
): Promise<void> {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
  await this.save();
};

// Clear all refresh tokens
UserSchema.methods.clearRefreshTokens = async function (): Promise<void> {
  this.refreshTokens = [];
  await this.save();
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

// JSON Schema for validation
export const UserJSONSchema = {
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
};

export const User = mongoose.model<IUser>("User", UserSchema);
