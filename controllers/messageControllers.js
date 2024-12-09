const asyncHandler = require('express-async-handler');
const User = require('../model/userDb');
const Message = require('../model/messageDb');
const Chat = require('../model/chatDb');
const sendMessage = asyncHandler(async(req,res)=>{
const {content, chatId} = req.body;
  if(!content || !chatId)
  {
    return res.status(400).send("Invalid data passed to sender");
  }
  let newMessage = {
    sender  :req.user._id,
    content:content,
    chat:chatId
  }
  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic email");

    // Populate the chat field, which also populates users nested inside the chat
    message = await message.populate({
        path: "chat",
        populate: {
            path: "users", // Nested population
            select: "name pic email",
        },
    });
  
    await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const getMessage = asyncHandler(async(req,res)=>{

  try {
   // console.log(req.params.chatId);
    const message = await Message.find({chat:req.params.chatId})
    .populate("sender" ,"name pic email")
    .populate("chat");
    
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

})
module.exports = {sendMessage,getMessage};