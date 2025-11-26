const express = require('express');
const addressController = require('../controllers/address.controllers');
const { authUserMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authUserMiddleware);

// Get all addresses
router.get('/', addressController.getAddresses);

// Add new address
router.post('/', addressController.addAddress);

// Update address
router.put('/:addressId', addressController.updateAddress);

// Delete address
router.delete('/:addressId', addressController.deleteAddress);

// Set default address
router.patch('/:addressId/default', addressController.setDefaultAddress);

module.exports = router;
