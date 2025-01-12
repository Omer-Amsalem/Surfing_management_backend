import express from "express";
import { registerUser, loginUser, logoutUser,refreshToken, updateUser, deleteUser, auth} from "../controller/userController"; 
import upload from "../config/storage";

const router = express.Router();

router.post("/register",upload.single("profilePicture") ,registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update",auth, upload.single("profilePicture"), updateUser);
router.delete("/delete",auth, deleteUser);
router.post("/refresh_token", refreshToken);

export default router;