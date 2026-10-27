import mongoose from "mongoose";
import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

export const getMessage = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res
        .status(404)
        .json({ successs: false, message: "Chat not fount" });
    }
    const message = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, message: { msg: message } });
  } catch (error) {
    console.log("Error in messageController", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    //Validate message content
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }
    let chat;
    //Existing chat case
    if (chatId) {
      //check valid mongodb ObjectId
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chat id" });
      }

      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
    }

    // 3. new chat case
    else {
      if (!model) {
        return res
          .status(400)
          .json({ message: "Model is required for new chat" });
      }
      chat = await Chat.create({
        userId: req.user._id,
        model,
        topic: content.trim().slice(0, 40),
      });
    }

    //4. save user message
    const userMessage = await Message.create({
        userId: req.user._id,
        chatId:chat._id,
        role:"user",
        content:content.trim()
    })

    res.status(200).json({success:true,message:"Message sent successfully"});

  } catch (error) {
    console.log("Error in messageController", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
