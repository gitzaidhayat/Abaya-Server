const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Cloth'
        },
        title: String,
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        size: String,
        color: String
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    orderMethod: {
      type: String,
      enum: ['Delivery', 'Pickup'],
      default: 'Delivery'
    },
    deliveryType: {
      type: String,
      default: 'Immediately'
    },
    status: {
      type: String,
      enum: ['New Order', 'Accepted by Restaurant', 'Prepared', 'Rejected by Store', 'Cancelled', 'Completed'],
      default: 'New Order'
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Card', 'Online'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    expectedDeliveryDate: Date,
    notes: String
  },
  {
    timestamps: true
  }
);

// Generate unique order ID before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.orderId = id;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
