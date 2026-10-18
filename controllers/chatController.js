import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

export const createChat = async (req, res) => {
  const { model } = req.body;
  if (!model) {
    return res
      .status(400)
      .json({ success: false, message: "Model name is missing" });
  }

  // model name should be valid

  try {
    const createdChat = await Chat.create({
      userId: req.user._id,
      model,
    });

    res.status(201).json({
      success: true,
      message: {
        chatId: createdChat._id,
        model,
        userId: req.user._id,
        topic: createdChat.topic,
        createdAt: createdChat.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in getRecentChat controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getRecentChat = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("topic,updatedAt")
      .limit(20);

    if (!chats) {
      return res
        .status(404)
        .json({ success: false, message: "No recent Chat found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Your recent chats are: ", chats });
  } catch (error) {
    console.log("Error in getRecentChat controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSingleChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "You are not allowed to do this" });
    }

    res.status(200).json({
      chatId: chat._id,
      userId: chat.userId,
      topic: chat.topic,
      usage: chat.usage,
    });
  } catch (error) {
    console.log("Error in getRecentChat controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res
        .status(403)
        .json({ success: false, message: "You are not allowed to do this" });
    }
    await Chat.deleteOne({ _id: chatId });
    await Message.deleteMany({ chatId: chat._id });
    res
      .status(200)
      .json({ success: true, message: "Your chat deleted successsfully" });
  } catch (error) {
    console.log("Error in getRecentChat controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
