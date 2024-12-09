
const mongoose = require("mongoose");
let schema = {
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content:{type:String, trim:true},
  chat:{type:mongoose.Schema.Types.ObjectId,
    ref:"Chat"}
  
};
const messageDb = mongoose.Schema(schema,{timestamps:true});

const Message = mongoose.model('Message', messageDb);
module.exports = Message;
