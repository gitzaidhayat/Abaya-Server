const express = require('express');
const router = express.Router();
const { authAdminMiddleware } = require('../middlewares/auth.middleware');

// Get dashboard statistics
router.get('/dashboard', authAdminMiddleware,  async (req, res) => {
  try {
    const User = require('../models/user.model');
    const Cloth = require('../models/cloth.model');
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total products count
    const totalProducts = await Cloth.countDocuments();
    
    // Mock data for now (you can replace with real calculations)
    const stats = {
      totalSales: 983410,
      salesChange: 3.48,
      totalOrders: 58375,
      ordersChange: -2.86,
      totalVisitors: 237782,
      visitorsChange: 8.35,
      conversionRate: 65,
      activeUsers: totalUsers || 2758,
      activeUsersChange: -6.02,
      productViews: 25000,
      productViewsChange: 3,
      returns: 8500,
      returnsChange: 8,
      completed: 6200,
      completedChange: 12,
      totalProducts: totalProducts || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get all orders with filters
router.get('/orders', authAdminMiddleware, async (req, res) => {
  try {
    const Order = require('../models/order.model');
    const { 
      limit = 50, 
      page = 1, 
      customerName, 
      dateFrom, 
      dateTo, 
      orderMethod,
      status 
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    
    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) filter.orderDate.$gte = new Date(dateFrom);
      if (dateTo) filter.orderDate.$lte = new Date(dateTo);
    }
    
    if (orderMethod) {
      filter.orderMethod = orderMethod;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'fullName email')
      .populate('items.product', 'title price')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ orderDate: -1 });
    
    const total = await Order.countDocuments(filter);
    
    res.json({ 
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/orders', authAdminMiddleware,  async (req, res) => {
  try {
    const Order = require('../models/order.model');
    const User = require('../models/user.model');
    
    // Find or use the admin as the user for the order
    let userId = req.user._id;
    
    // If email is provided, try to find existing user
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        userId = existingUser._id;
      }
    }
    
    const orderData = {
      user: userId,
      customerName: req.body.customerName,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      orderMethod: req.body.orderMethod || 'Delivery',
      deliveryType: req.body.deliveryType || 'Immediately',
      status: req.body.status || 'New Order',
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'COD',
      notes: req.body.notes
    };
    
    const order = await Order.create(orderData);
    
    res.status(201).json({ 
      message: 'Order created successfully', 
      order 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', authAdminMiddleware, async (req, res) => {
  try {
    const Order = require('../models/order.model');
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'fullName email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get all users
router.get('/users', authAdminMiddleware, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const { limit = 100, page = 1, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password -confirmPassword')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get single user by ID
router.get('/users/:id', authAdminMiddleware, async (req, res) => {
  try {
    const User = require('../models/user.model');
    
    const user = await User.findById(req.params.id)
      .select('-password -confirmPassword');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user information
router.put('/users/:id', authAdminMiddleware, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const { fullName, email, phone, isVerified } = req.body;
    
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -confirmPassword');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', authAdminMiddleware, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -confirmPassword');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User status updated', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Delete user
router.delete('/users/:id', authAdminMiddleware, async (req, res) => {
  try {
    const User = require('../models/user.model');
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Coupon routes (mock for now)
router.get('/coupons', authAdminMiddleware, async (req, res) => {
  try {
    // Mock coupons data
    const coupons = [
      { code: 'WELCOME10', discount: 10, description: '10% off for new users' },
      { code: 'SUMMER20', discount: 20, description: '20% off summer sale' }
    ];
    
    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

module.exports = router;
