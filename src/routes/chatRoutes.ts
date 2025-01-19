import express from 'express';
import chatController from '../controller/chatController'; 
import {auth} from '../controller/userController';

const router = express.Router();

router.post('/message',auth, chatController.sendMessage);

export default router;