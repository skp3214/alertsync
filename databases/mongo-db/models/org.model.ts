import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrganization extends Document {
  _id: Types.ObjectId
  name: string
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "HR",
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const OrganizationModel = mongoose.models.Organization as mongoose.Model<IOrganization> || mongoose.model<IOrganization>("Organization", OrganizationSchema);