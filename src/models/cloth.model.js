const mongoose = require('mongoose');

const clothSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }]
});

const clothModel = mongoose.model('Cloth', clothSchema);

module.exports = clothModel;