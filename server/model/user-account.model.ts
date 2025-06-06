import mongoose from "mongoose";

const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  avatar: String,
  phone: String,
}, {
  timestamps: true
})

const UserAccount = mongoose.model('UserAccount', schema, "user-account");

export default UserAccount;