const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  userId: String,
  buyer: String,
  buyerEmail: String,
  items: Array,
  shopName: String,
  shops: [String],
  subtotal: Number,
  deliveryFee: Number,
  platformFee: Number,
  total: Number,
  status: { type: String, default: 'Processing' },
  paymentStatus: { type: String, default: 'Pending' }, // 'Paid', 'Pending', 'Failed'
  paymentMethod: { type: String, default: 'Cash on Delivery' }, // 'Stripe', 'Cash on Delivery'
  stripeSessionId: { type: String, default: '' },
  stripePaymentIntentId: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
