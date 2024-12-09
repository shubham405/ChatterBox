const asyncHandler = require('express-async-handler');
const User = require('../model/userDb');
const generateToken = require('../config/generateToken');
const { options } = require('../routes/userRoutes');
const  registerUser = asyncHandler(async (req,res)=>{
   const {name,email,pic,password} = req.body;
   if(!name || !email || !password)
   {
    res.status(400);
    throw new Error("Please Enter all the Fields");
   }
   const userExist = await User.findOne({email});
   if(userExist)
   {
    console.log(userExist);
    
    res.status(400);
    throw new Error("User already exists");
   }
   else
   {
     const user = await User.create({
        name,
        email,
        password,
        pic
     });
     if(user)
     {
        return res.status(201).json({
            _id:user._id,
            name:user.name,
            email: user.email,
            pic:user.pic,
            token:generateToken(user._id),
        });
     }
     else
     {
        res.status(400);
        throw new Error("Faield to create user");
     }
    }
});
const authUser = asyncHandler(async (req,res)=>{
   
    
    const {email,password} = req.body;
    
    const user = await User.findOne({email});
    if (user && (await user.matchPassword(password)))
    {
        return res.status(200).json({
            _id:user._id,
            name:user.name,
            email: user.email,
            pic:user.pic,
            token:generateToken(user._id),
        });
    }
    else
    {
        res.status(401);
        throw new Error("Invalid Email or Password")
    }

});
const searchUser = asyncHandler(async (req,res)=>{
    // console.log(req);
    
    
    
    const keyword = req.query.search?{
        $or:[
            {name:{$regex:req.query.search, $options:"i"}

            },
            {
                email:{$regex:req.query.search, $options:"i"}
            }
        ]
    }:{};
    console.log(keyword);
    
    const user = await User.find(keyword).find({_id:{$ne:req.user._id}}).select("-password");
    console.log(req.user);
    res.status(200).send(JSON.stringify(user));
    
    
})

module.exports = {registerUser,authUser,searchUser};