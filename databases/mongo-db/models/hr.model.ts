import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHr extends Document {
    _id: Types.ObjectId
    username: string,
    email: string,
    password: string,
    name: string,
    role: 'HR',
    orgId: Types.ObjectId,
    emailVerified: boolean,
    otpCode?: string,
    otpExpiresAt?: Date,
    createdAt: Date,
    updatedAt: Date
}

const HrSchema = new Schema<IHr>({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    role: {
        type: String,
        default: "HR"
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: [true, "organisation_id is required"]
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String
    },
    otpExpiresAt: {
        type: Date
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

HrSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const HrModel = mongoose.models.HR as mongoose.Model<IHr> || mongoose.model<IHr>('HR', HrSchema);