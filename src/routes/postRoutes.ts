import express from "express";
import {
    createPost,
    getAllPosts,
    getFuturePosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    joinPost,
    deleteAllLikes,
    deleteAllParticipants,
} from "../controller/postController";
import { auth } from "../controller/userController";
import upload from "../config/storage";

const router = express.Router();

router.post("/create", auth,upload.single("photo"), createPost);

router.get("/getAll", auth, getAllPosts);

router.get("/futurePosts",auth, getFuturePosts);

router.get("/getById/:id",auth, getPostById);

router.put("/update/:id", auth,upload.single("photoUrl"), updatePost);

router.delete("/delete/:id", auth, deletePost);

router.post("/like/:id", auth, likePost);

router.post("/join/:id", auth, joinPost);

router.delete("/deleteAllLikes/:id", auth, deleteAllLikes);

router.delete("/deleteAllParticipants/:id", auth, deleteAllParticipants);




export default router;
