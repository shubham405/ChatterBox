const express  = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const chats = require('./data/data');
const { db } = require('./config/connectDb');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { connect } = require('mongoose');
dotenv.config();
app.use(cors('localhost:3000'));
// express.json is used to accept the json data
app.use(express.json());
const CORS_URL = process.env.CORS || "http://localhost:3000";

const PORT = process.env.PORT || 5000;

app.get ('/',(req,res)=>{
    res.status(200).send("Backend is up");
});
app.use('/api/user', userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);


app.use(notFound);
app.use(errorHandler);
const server = app.listen(PORT,'0.0.0.0',()=>{
    db();
}
)

const io = require('socket.io')(server,
    
    {
        pingTimeout:60000,
        cors:{
            origin:CORS_URL
        },
    }
)
io.on("connection", (socket)=>{
    console.log("Connected to socket.io");
    // here from front end we will ge the data
    socket.on('setup',(userData)=>{
        // creating a room for particular user
        socket.join(userData._id);
        //console.log(userData._id);
        socket.emit("connected");

    });
    socket.on("join chat", (room)=>{
        socket.join(room);
        console.log("User joined room "+room);
    });
    socket.on('new message', (newMessageRecieved)=>{
        let chat = newMessageRecieved.chat;
        console.log(chat);
        
        if(!chat.users)
        {
            return console.log("chat.user not defined");
        }
        chat.users.forEach(user=>{
           // console.log(user._id === newMessageRecieved.sender._id);
            
            if(user._id === newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    });
    socket.on('typing',(room)=>{
        socket.in(room).emit("typing");
    })
    socket.on('stop typing',(room)=>{
        socket.in(room).emit("stop typing");
    })
    socket.off("setup", ()=>{
        console.log("User Disconnected");
        socket.leave(userData._id);
        
    })
});
