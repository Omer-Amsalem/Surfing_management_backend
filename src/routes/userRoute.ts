import express from "express";
import { registerUser, loginUser, logoutUser,refreshToken, updateUser, deleteUser, auth} from "../controller/userController"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update",auth, updateUser);
router.delete("/delete",auth, deleteUser);
router.post("/refresh_token", refreshToken);

export default router;