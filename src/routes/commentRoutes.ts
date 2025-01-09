import express from "express";
import {
    createComment,
    getCommentsByPostId,
    getCommentById,
    getCommentsByUserId,
    updateComment,
    deleteComment,
    deleteAllComments
} from "../controller/commentController";
import { auth } from "../controller/userController";

const router = express.Router();

router.post("/create/:postId", auth, createComment);

router.get("/postId/:postId",auth, getCommentsByPostId);

router.get("/commentId/:commentId",auth, getCommentById);

router.get("/userId/:userId",auth, getCommentsByUserId);

router.put("/update/:commentId", auth, updateComment);

router.delete("/delete/:commentId", auth, deleteComment);

router.delete("/deleteAll/:postId", auth, deleteAllComments);


export default router;
