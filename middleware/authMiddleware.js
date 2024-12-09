const jwt = require('jsonwebtoken');
const User = require('../model/userDb');
const asyncHandler = require('express-async-handler');
const protect = asyncHandler(async(req,res,next)=>{
    let token;
    //console.log(req.headers.authorization);
    
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    {
        
        try{
            token =   req.headers.authorization.split(" ")[1];
           
      const decode = await jwt.verify(token,process.env.JWT_SECRET);
            
      req.user = await User.findById(decode.id).select("-password");
    //console.log(await User.findById(decode.id));
      next();
        }
        catch(error)
        {
            res.status(401);
            throw new Error("Unauthorized, token failed");
            
        }
      
      
    }
    if(!token)
    {
        res.status(401);
        throw new Error("Unauthorized token");
    }
});
module.exports = protect;