const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allows multiple null values
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      minlength: [7, "Phone number too short"],
      maxlength: [15, "Phone number too long"],
      sparse: true, // Allows multiple null values
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["nurse", "physio"],
      required: [true, "Please specify your role"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false, // Exclude verificationCode field by default when querying
      default: null,
    },
    verificationCodeValidity: {
      type: Number,
      select: false, // Exclude verificationCodeValidity field by default when querying
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
