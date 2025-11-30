const ProductVideo = require('../models/productVideo.model');
const { uploadVideo } = require('../services/storage.services');
const storageService = require('../services/storage.services');
const uuid = require('uuid').v4;

async function createVideo(req, res) {
    try {
        console.log('Creating video - Body:', req.body);
        console.log('Creating video - File:', req.file);

        // Validate required fields
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Video file is required"
            });
        }
        
        if (!req.body.title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        // Upload video file to ImageKit
        console.log('Uploading video file:', req.file.originalname, 'Size:', req.file.size);
        const fileUploadResult = await storageService.uploadVideo(
            req.file.buffer.toString('base64'),
            `video_${Date.now()}_${req.file.originalname}`
        );
        console.log('Video uploaded to:', fileUploadResult.url);

        // Create video record
        const videoItem = await ProductVideo.create({
            title: req.body.title,
            video: fileUploadResult.url,
            productId: req.body.productId || null,
            productName: req.body.productName || '',
            price: Number(req.body.price) || 0,
            category: req.body.category || 'featured',
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        });

        res.status(201).json({
            success: true,
            message: "Video created successfully",
            video: videoItem
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create video",
            error: error.message
        });
    }
}

async function getVideoById(req, res) {
    try {
        const video = await ProductVideo.findById(req.params.id)
            .populate('productId', 'title price description images');
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Video fetched successfully",
            video: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch video",
            error: error.message
        });
    }
}

async function getAllVideos(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const category = req.query.category;
        
        const query = {};
        if (category) {
            query.category = category;
        }
        
        const videos = await ProductVideo.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('productId', 'title price images');
        
        res.status(200).json({
            success: true,
            message: "Videos fetched successfully",
            videos: videos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch videos",
            error: error.message
        });
    }
}

async function updateVideo(req, res) {
    try {
        console.log('Updating video - Body:', req.body);
        console.log('Updating video - File:', req.file);
        
        let updateData = {
            title: req.body.title,
            productId: req.body.productId || null,
            productName: req.body.productName || '',
            price: Number(req.body.price) || 0,
            category: req.body.category || 'featured',
            isActive: req.body.isActive === 'true' || req.body.isActive === true
        };
        
        // Upload new video file if provided
        if (req.file) {
            console.log('Uploading new video file:', req.file.originalname);
            const fileUploadResult = await storageService.uploadVideo(
                req.file.buffer.toString('base64'),
                `video_${Date.now()}_${req.file.originalname}`
            );
            updateData.video = fileUploadResult.url;
            console.log('New video uploaded to:', updateData.video);
        }
        
        const videoItem = await ProductVideo.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!videoItem) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            video: videoItem
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update video",
            error: error.message
        });
    }
}

async function deleteVideo(req, res) {
    try {
        const videoItem = await ProductVideo.findByIdAndDelete(req.params.id);
        
        if (!videoItem) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Video deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete video",
            error: error.message
        });
    }
}

module.exports = {
    getAllVideos,
    getVideoById,
    createVideo,
    updateVideo,
    deleteVideo
};
