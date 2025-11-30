const mongoose = require('mongoose');

const productVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cloth'
    },
    productName: {
        type: String
    },
    price: {
        type: Number
    },
    category: {
        type: String,
        default: 'featured'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const productVideoModel = mongoose.model('ProductVideo', productVideoSchema);

module.exports = productVideoModel;
