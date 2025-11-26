const User = require('../models/user.model');
const clothModel = require('../models/cloth.model');

// Get wishlist
async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ items: user.wishlist || [] });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
}

// Add item to wishlist
async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    const product = await clothModel.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(productId)) {
      return res.status(200).json({ message: 'Already in wishlist', items: user.wishlist });
    }
    user.wishlist.push(productId);
    await user.save();
    const populated = await user.populate('wishlist');
    res.status(201).json({ message: 'Added to wishlist', items: populated.wishlist });
  } catch (e) {
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
}

// Remove item
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    const populated = await user.populate('wishlist');
    res.json({ message: 'Removed from wishlist', items: populated.wishlist });
  } catch (e) {
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };