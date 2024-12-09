const mongoose = require("mongoose");
// chatName,isGroupChat,users,latestMessage,groupAdmin
let schema = {
  chatName: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId,
    ref:"User"
   }],
   latestMessage:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Message"
   },
   groupAdmin:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   }
};
const chatDb = mongoose.Schema(schema,{timestamps:true});

const Chat = mongoose.model('Chat', chatDb);
module.exports = Chat;
