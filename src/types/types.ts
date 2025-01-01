import { UserDocument } from "../models/userModel";
declare module "express-serve-static-core" {
    interface Request {
        user?: UserDocument;
    }
}