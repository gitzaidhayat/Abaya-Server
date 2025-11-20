const mongoose = require('mongoose');



const clothPartnerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
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
        required: true
    },
    confirmPassword:{
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'clothPartner'
    }
}, {
    timestamps: true
})

const clothPartnerModel = mongoose.model('ClothPartner', clothPartnerSchema);

module.exports = clothPartnerModel;