import mongoose, { Schema, Document } from "mongoose";

interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    activityCount: number;
    isHost: boolean;
    profilePicture: string;
    description: string;
    refreshToken: string[];
}

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    role: {
        type: String,
        required: true,
    },
    activityCount: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
        minlength:[6, "Password must be at least 6 characters long"],
    },
    isHost: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String,
        default : "",
    },
    description: {
        type: String,
        default: "",
    },
    refreshToken:{
        type: [String],
        default: [],
    }
});

export default mongoose.model<IUser>("User", userSchema);


export interface UserDocument extends IUser, Document {}
