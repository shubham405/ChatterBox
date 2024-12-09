const mongoose = require('mongoose');

const db = async()=>{
        try {
            mongoose.set('strictQuery',false)
           const con =  await mongoose.connect(process.env.DB_URLS, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
              });
            console.log("DB connection Successful", con.connection.host);
            
        } catch (error) {
            console.log(error.message);
            console.log("DB connection failed");
            
        }
}
module.exports ={db};