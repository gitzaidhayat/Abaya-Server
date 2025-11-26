const Order = require('../models/order.model');
const User = require('../models/user.model');

// Create new order
async function createOrder(req, res) {
  try {
    const { items, shippingAddress, paymentMethod, notes, subtotal, discount, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item"
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      customerName: shippingAddress.fullName || user.fullName,
      items: items.map(item => ({
        product: item.product,
        title: item.title || item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.variant?.size,
        color: item.variant?.color,
      })),
      totalAmount: total || subtotal,
      shippingAddress: {
        street: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || user.phone
      },
      paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod === 'card' ? 'Card' : 'Online',
      notes,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
}

// Get user's orders
async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
}

// Get single order by ID
async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('user', 'fullName email phone');
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Check if order belongs to user
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to view this order"
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      message: "Failed to fetch order"
    });
  }
}

// Cancel order
async function cancelOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to cancel this order"
      });
    }

    // Check if order can be cancelled
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({
        message: "Cannot cancel this order"
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      message: "Failed to cancel order"
    });
  }
}

// Track order
async function trackOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select('status orderDate expectedDeliveryDate');
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      status: order.status,
      orderDate: order.orderDate,
      expectedDeliveryDate: order.expectedDeliveryDate,
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      message: "Failed to track order"
    });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
};
