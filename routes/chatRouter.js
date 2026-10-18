import express from 'express';
import { isAuth } from '../middleware/isAuth.js';
import { createChat, deleteChat, getRecentChat, getSingleChat } from '../controllers/chatController.js';

//Get recent chat: top 20 chats, get Single chat, createChat, deleteChat

const chatRouter = express.Router();

chatRouter.use(isAuth)

chatRouter.post('/createChat',createChat);
chatRouter.get('/getRecentChat',getRecentChat);
chatRouter.get('/:chatId',getSingleChat);
chatRouter.delete('/:chatId',deleteChat);

export default chatRouter;