import mongoose, { Schema, Document } from "mongoose";

interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    job: string;
    activityCount: number;
    isHost: boolean;
    profilePicture: string;
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
    },
    job: {
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
    },
    isHost: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String,
        default : "",
    },
    refreshToken:{
        type: [String],
        default: [],
    }
});

export default mongoose.model<IUser>("User", userSchema);


export interface UserDocument extends IUser, Document {}
