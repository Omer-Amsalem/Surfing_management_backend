import express from "express";
import { registerUser, loginUser, logoutUser,refreshToken, updateUser, deleteUser, auth, getUserById} from "../controller/userController"; 
import upload from "../config/storage";
import { get } from "http";

const router = express.Router();

router.post("/register",upload.single("profilePicture") ,registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update",auth, upload.single("profilePicture"), updateUser);
router.delete("/delete",auth, deleteUser);
router.get("/getUser/:id", auth , getUserById);
router.post("/refresh_token", refreshToken);

export default router;