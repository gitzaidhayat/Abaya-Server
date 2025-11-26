const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
      maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^[0-9\-\+\s]*$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    confirmPassword: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'partner'],
      default: 'user'
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cloth'
    }],
    addresses: [{
      fullName: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      locality: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true
      },
      landmark: {
        type: String,
        trim: true
      },
      alternatePhone: {
        type: String,
        trim: true
      },
      addressType: {
        type: String,
        enum: ['home', 'work'],
        default: 'home'
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isVerified: {
      type: Boolean,
      default: false
    }
   
  },
  {
    timestamps: true
  }
);


// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Also hash confirmPassword if needed
  if (this.confirmPassword) {
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
  }
  
  next();
});



const User = mongoose.model('User', userSchema);

module.exports = User;