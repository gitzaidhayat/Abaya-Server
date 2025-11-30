const express = require('express');
const videoController = require('../controllers/productVideo.controllers');
const router = express.Router();
const multer = require('multer');

// Configure multer for video uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.post('/', upload.single("video"), videoController.createVideo);
router.put('/:id', upload.single("video"), videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
