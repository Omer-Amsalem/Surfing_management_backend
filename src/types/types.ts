import { UserDocument } from "../models/userModel";
declare module "express-serve-static-core" {
    interface Request {
        fileValidationError?: string;
        user?: UserDocument;
    }
}