const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    confirmPassword:{
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true
})

// Encrypt password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Also hash confirmPassword if needed
  if (this.confirmPassword) {
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
  }
  
  next();
});

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = adminModel;