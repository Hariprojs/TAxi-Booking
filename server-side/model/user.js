const mongoose=require("mongoose")

//user info model

const Users = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    Name:{type:String,required:true},
    role: { type: String, enum: ["customer", "driver"], default: "customer" },
    Vehicleno:{
      type:String,
  },
  isbusy:{type:String},
  passengerid:{type:String},
  amount:{type:String}
  });


  //pre-validation
  Users.pre('save', function (next) {
    if (this.role === 'driver' && !this.Vehicleno) {
      next(new Error('Vehicleno is required for drivers'));
    } else {
      next(); 
    }
  });
  

const usermodel=mongoose.model("users",Users)
module.exports=usermodel;





