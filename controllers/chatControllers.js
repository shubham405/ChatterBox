const asyncHandler = require("express-async-handler");
const Chat = require("../model/chatDb");
const User = require("../model/userDb");
const createChats = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "Please Provide userId" }));
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  console.log(isChat);

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  console.log("new isChat", isChat);

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const created = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: created._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
const fetchChats = asyncHandler(async (req, res) => {
  try {
    let chat = Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    return res.status(200).send(chat);
  } catch (error) {}
});
const createGroupChat = asyncHandler(async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please provide all the fields" });
    }
    let users = req.body.users;
    //users  = JSON.stringify(users);

    if (users.length < 2) {
      return res
        .status(400)
        .send({ message: "More than two users required to form a group" });
    }
    users.push(req.user);
    //console.log("this ", users);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
   

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(500).json(error);
  }
});
const renameGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    

    const chatUpdated = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!chatUpdated) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else return res.status(200).send(chatUpdated);
  } catch (error) {
    

    res.status(500);
    throw new Error(error);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
      res.status(400);
      throw new Error("Please fill all the value");
    } else {
        const chat = await Chat.findById(chatId);

    // Check if the user already exists in the chat group
    const usersToAdd = userId.filter(id => !chat.users.includes(id));

    if (usersToAdd.length === 0) {
      return res.status(400).json({ message: "All provided users are already exist in the chat group" });
    }
       
      const added = await Chat.findByIdAndUpdate(chatId, {
        $push: {
          users: usersToAdd
        }
        
      },
      {
        new:true
    }).populate("users", "-password")
    .populate("groupAdmin", "-password");;
    
    if(!added)
    {
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else
     return res.status(200).send(added);        
   
    }
  } catch (error) {
    console.log(error);   
    res.status(500).json(error);
  }
});

const removeFromGroup = asyncHandler(async(req,res)=>{
  
    try {
        const {chatId, userId} = req.body;
        if (!chatId || !userId) {
            res.status(400);
            throw new Error("Please fill all the value");
          } else {
            const removed = await Chat.findByIdAndUpdate(chatId, {
              $pull: {
                users: userId
              }
              
            },
            {
              new:true
          }).populate("users", "-password")
          .populate("groupAdmin", "-password");
          if(!removed)
          {
              res.status(404);
              throw new Error("Chat Not Found");
          }
          else
          res.status(200).send(removed);        
         
          }
        
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = { createChats, fetchChats, createGroupChat, renameGroup,addToGroup,removeFromGroup };
