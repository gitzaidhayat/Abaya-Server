const express = require('express');
const router = express.Router();
const { authUserMiddleware } = require('../middlewares/auth.middleware');
const wishlistController = require('../controllers/wishlist.controllers');

router.get('/', authUserMiddleware, wishlistController.getWishlist);
router.post('/', authUserMiddleware, wishlistController.addToWishlist);
router.delete('/:productId', authUserMiddleware, wishlistController.removeFromWishlist);

module.exports = router;