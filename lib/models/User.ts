import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Address Sub-Schema (Users can have multiple addresses)
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
  isDefault: { type: Boolean, default: false },
});

// 2. Main User Schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],

      
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Prevents password from returning in queries by default
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'DELIVERY_BOY'],
      default: 'USER',
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    
    // Specific to Customer / User
    addresses: [AddressSchema],

    // Specific to Delivery Boy
    isApproved: {
      type: Boolean,
      default: false, // Admin needs to approve delivery boy before they get orders
    },
    isAvailable: {
      type: Boolean,
      default: false, // Active/Offline toggle for delivery boy
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    vehicleType: {
      type: String,
      enum: ['BIKE', 'SCOOTER', 'BICYCLE', 'NONE'],
      default: 'NONE',
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Prevent re-compilation of model in Next.js hot-reloading
const User: Model<any> = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
