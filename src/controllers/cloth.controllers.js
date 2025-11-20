const clothModel = require('../models/cloth.model');    
const storageService = require('../services/storage.services');
const { v4: uuid} = require('uuid');


async function createCloth(req, res) {
    try {
        // File upload (validation already passed)
        const fileUploadResult = await storageService.uploadImage(req.file.buffer, uuid());

        // Create cloth item (data is already validated)
        const clothItem = await clothModel.create({
            title: req.body.name,
            description: req.body.description,
            price: req.body.price,
            size: req.body.size,
            color: req.body.color,
            stock: req.body.stock,
            images: [fileUploadResult.url]
        });

        res.status(201).json({
            success: true,
            message: "Cloth Created Successfully",
            cloth: clothItem
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create cloth item",
            error: error.message
        });
    }
}


async function getAllCloths(req, res) {
    try {
        const cloths  = await clothModel.find({})
        res.status(200).json({
            success: true,
            massage: "Cloths fetched successfully",
            cloths: cloths
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch cloths",
            error: error.message    
        })
    }
}



async function deleteCloth(req, res) {
    try {
        const cloths  =  await clothModel.findByIdAndDelete(req.params.id)
        res.status(200).json({
            success: true,
            message: "Cloth deleted successfully",
            cloths: cloths
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete cloth",
            error: error.message
        })
    }
}




module.exports = {
    createCloth,
    getAllCloths,
    deleteCloth
}