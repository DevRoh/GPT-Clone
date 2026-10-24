import express from 'express';
import {isAuth} from "../middleware/isAuth.js"
import { getMessage, sendMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.use(isAuth)

messageRouter.post('/',sendMessage);
messageRouter.get('/:chatId',getMessage);
messageRouter.post('/:chatId',sendMessage);

export default messageRouter;