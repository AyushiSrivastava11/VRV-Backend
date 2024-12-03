import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    phone: string;
    otp?: string;
    otpExpire?: Date;
    orders?: string[];
    compareOtp(otp: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        phone: { type: String, required: true, unique: true },
        otp: String,
        otpExpire: Date,
        // orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    },
    { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("otp") && this.otp) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.otp = await bcrypt.hash(this.otp, salt);
        } catch (error:any) {
            return next(error);
        }
    }

    next();
});

// Method to compare OTP
userSchema.methods.compareOtp = async function (otp: string): Promise<boolean> {
    return bcrypt.compare(otp, this.otp!);
};

export default mongoose.model<IUser>("User", userSchema);
