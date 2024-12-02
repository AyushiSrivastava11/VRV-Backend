import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    url: string;
    public_id: string;
  };
  role: string;
  isActive: boolean;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const adminSchema: Schema<IAdmin> = new Schema({
  name: { type: String, required: [true, "Please enter your name"] },
  email: {
    type: String,
    required: [true, "Please Enter your Email"],
    validate: {
      validator: function (val: string) {
        return emailRegexPattern.test(val);
      },
      message: "Please enter a valid email",
    },
    unique: true,
  },
  password: {
    type: String,
   
    minlength: [8, "Password must be at least 8 characters"],
    validate: {
      validator: function (val: string) {
        return passwordRegexPattern.test(val);
      },
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    },
    select: false,
  },
  avatar: {
    public_id: { type: String },
    url: { type: String },
  },
  role: {
    type: String,
    enum: ["cook", "admin", "accounts", "waiter"],
    default: "admin",
  },
  isActive:{type:Boolean,default:true}
},{timestamps:true});


//Hash Password before saving
adminSchema.pre<IAdmin>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Sign Access token
adminSchema.methods.SignAccessToken = function(){
  return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || "" , {expiresIn: "15m"});
}

//Sign Refresh token
adminSchema.methods.SignRefreshToken = function(){
  return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || "", {expiresIn: "7d"});
}

//Compare Password
adminSchema.methods.comparePassword = async function (
  enteredPassowrd: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassowrd, this.password);
};

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;