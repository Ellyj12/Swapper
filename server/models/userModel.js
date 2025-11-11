import mongoose  from "mongoose";
import bcrypt from 'bcryptjs'
import validator from 'validator';

const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email : {type:String, required:true , validate:[validator.isEmail,'Invalid email format'], unique:true},
    password: {type:String, required:true},
    username :{type:String , required:true},
    points:{type:Number,default:10},
    location: {
    type: { type: String, enum: ['Point'], required:false },
    coordinates: { type: [Number], required: false } 
  }

})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;