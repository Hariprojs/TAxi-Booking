const express=require("express")
const user=require("../model/user")
const Router=express.Router()
const bcrypt=require('bcryptjs')
const generatedtoken=require("../token generation/token")
const verified=require("../middleware/middle")
const axios = require('axios');
const BookingInfo = require("../model/booking")
const mongoose=require("mongoose")


Router.get('/test',(req,res)=>{
res.json({message:"api working successfully"})
})


Router.post('/user',async (req,res)=>{
let {email,password,role,Name,Vehicleno}=req.body


let matchEmail=await user.findOne({email})

console.log('dfd',matchEmail)

if(!matchEmail){

    let hashedpwd= await bcrypt.hash(password,10)
    let savedetails={email,password:hashedpwd,role:role,Name:Name}
    if(role=='driver'){
        savedetails.Vehicleno=Vehicleno
    }
    let usersave=new user(savedetails)
   
    await usersave.save()
    let userRecord = await user.findOne({email})
    let token= await generatedtoken(userRecord.id)


   return res.json({message:"signed up successfully",statusCode:200,token:token,userid:userRecord.id})




}
return res.json({message:"User already exists",statusCode:400})


})


Router.post("/authenticate",async (req,res)=>{
const {email,password,role}=req.body

let userRecord=await user.findOne({email})

console.log('dfnd',userRecord)

if(!userRecord){
return res.json({message:"user is not registered yet"})
}
let isMatched= await bcrypt.compare(password,userRecord.password)
if(isMatched){
if(userRecord.role!==role){
  return res.json({statusCode:401,message:`This User account cannot log in as a ${role}`})
}

let token= await generatedtoken(userRecord.id)
console.log(token)
return res.json({message:'log in successful',statusCode:200,token:token,userid:userRecord.id,userRecord})

    
}
res.json({message:"Incorrect password",statusCode:402})

})



Router.post('/book', async (req, res) => {
    try {
      const { userId, orgin, destination, pickupTime } = req.body;
  
      const bookingInfo = new BookingInfo({
        userId,
        orgin,
        destination,
        pickupTime,
      });
  
      await bookingInfo.save();
  
      res.status(201).json({ message: 'Now let us wait till we get a ride' ,statusCode:200});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });






Router.get('/bookedorgins', async (req, res) => {
    try {
      const uniqueOrigins = await BookingInfo.distinct('orgin', { cancelled: { $ne: 'yes' } });
     
     res.json({message:"successfully fetched",statusCode:200,data:uniqueOrigins});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


  Router.get('/usersByOrigin/:origin', async (req, res) => {
    try {
      const { origin } = req.params;
  
      const bookings = await BookingInfo.find({ orgin:origin,cancelled:{$ne:'yes'},  });
  
      const userIds = bookings.map((booking) => booking.userId);
  
      const users = await user.find({ _id: { $in: userIds } });
  
      const userBookingInfo = users.map((user) => {
        const booking = bookings.find((booking) => booking.userId.toString() === user._id.toString());
        return {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          bookingInfo: {
            origin: booking.origin,
            destination: booking.destination,
            pickupTime: booking.pickupTime,
          },
        };
      });
  
      res.json({ data: userBookingInfo, message: 'Successfully fetched', statusCode: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  Router.get('/getUserDetails/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Fetch user details from the User collection
      const Userdata = await user.findById(userId);
  
      if (!Userdata) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Fetch booking details from the Booking collection based on the userId
      const bookingsdetails = await BookingInfo.find({
        userId,
        cancelled: { $ne: 'yes' },
    });

      res.json({ data:[Userdata, bookingsdetails], message: 'User details fetched successfully', statusCode: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  Router.put('/updateBooking/:userId', async (req, res) => {//driver
    try {
      const userId = req.params.userId;
      const { bookedby,Username,driverid } = req.body;
  
      // Find the booking by ID
      const booking = await BookingInfo.findOne({ userId, cancelled: { $ne: 'yes' } });

      if(!bookedby){
        const userUpdateResult = await updateUserDataToNull(driverid);
    }    
  
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
  
      // Update the bookedby field
      booking.bookedby = bookedby;

      
      // Save the updated booking
      const updatedBooking = await booking.save();
  
      res.json({
        booking: updatedBooking,
        message: 'Booking updated successfully',
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


 Router.post('/updatecancel/:bookingId', async (req, res) => {// booking cancellor
    try {
      const userId = req.params.bookingId;
      const {driverid}=req.body
  
      // Find the booking by ID
      const booking = await BookingInfo.findOne({
        userId,
        cancelled: { $ne: 'yes' },
    });

      if (booking.length==0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
  
      // Update the bookedby field
      booking.cancelled = 'yes';
      const drivercancelled=await updateUserDataToNull(driverid)
      

      // Save the updated booking
      const updatedBooking = await booking.save();
  
      res.json({
        booking: updatedBooking,
        message: 'cancel updated successfully',
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  // API route to save isbusy, passengerid, and amount in the users collection
  Router.post('/savePassengerData', async (req, res) => {
    try {
      const { userId, isbusy, passengerid, amount } = req.body;
  
      // Find the user by userId
      const Passenger = await user.findById(userId);
  
      if (!Passenger) {
        return res.status(404).json({ message: 'User not found', statusCode: 404 });
      }
  
      // Update the user fields
      Passenger.isbusy = isbusy;
      Passenger.passengerid = passengerid;
      Passenger.amount = amount;
  
      // Save the updated user
      await Passenger.save();
  
      res.status(200).json({ message: 'User data saved successfully', statusCode: 200 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // API route to update isbusy, passengerid, and amount to nulls
  Router.post('/updateUserDataToNull', async (req, res) => {
    try {
      const { userId } = req.body;
     await updateUserDataToNull(userId)
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

  //functions
  const updateUserDataToNull = async (userId) => {
    try {
      // Find the user by userId
      const driver = await user.findOne({ _id: userId });

if (!driver) {
  return { success: false, message: 'User not found', statusCode: 404 };
}

// Update the user fields to null
driver.isbusy = null;
driver.passengerid = null;
driver.amount = null;

// Save the updated user
await driver.save();
  
      return { success: true, message: 'Driver data updated to null successfully', statusCode: 200 };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal Server Error', statusCode: 500 };
    }
  };
  
  



module.exports=Router;