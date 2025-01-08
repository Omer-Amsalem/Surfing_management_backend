import express from "express";
import {
    createComment,
    getCommentsByPostId,
    getCommentById,
    getCommentsByUserId,
    updateComment,
    deleteComment,
} from "../controller/commentController";
import { auth } from "../controller/userController";

const router = express.Router();

router.post("/create", auth, createComment);

router.get("/:postId",auth, getCommentsByPostId);

router.get("/:commntId",auth, getCommentById);

router.get("/:commntId",auth, getCommentsByUserId);

router.put("/:commentId", auth, updateComment);

router.delete("/:commentId", auth, deleteComment);

export default router;
