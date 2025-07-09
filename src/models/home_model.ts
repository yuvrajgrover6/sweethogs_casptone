import mongoose, { Document, Schema } from 'mongoose';

export interface IHome extends Document {
  title: string;
  description: string;
  content: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const HomeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// JSON Schema for validation
export const HomeJSONSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 200,
    },
    description: {
      type: "string",
      minLength: 1,
      maxLength: 500,
    },
    content: {
      type: "string",
      minLength: 1,
    },
    isActive: {
      type: "boolean",
    },
    createdBy: {
      type: "string",
      minLength: 1,
    },
  },
  required: ["title", "description", "content", "createdBy"],
  additionalProperties: false,
};

export const HomeModel = mongoose.model<IHome>('Home', HomeSchema);
export default HomeModel;
