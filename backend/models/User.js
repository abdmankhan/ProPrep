import mongoose from "mongoose";
import bcrypt from "bcryptjs";

  const userSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: null,
      required: function () {
        return !this.googleId; // Password is required only for non-Google users
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  });

userSchema.pre("save", async function(next){
  if(!this.isModified("password") || this.password === null){
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
}
  
const User = mongoose.model("User", userSchema);

export default User;