const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stripeSessionId: {
    type: String,
    default: '',
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
    default: '',
    index: true,
  },
  orderId: {
    type: String,
    default: '',
    index: true,
  },
  userId: {
    type: String,
    default: '',
    index: true,
  },
  buyerName: {
    type: String,
    default: 'Wholesale Buyer',
  },
  buyerEmail: {
    type: String,
    default: '',
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'inr',
  },
  status: {
    type: String,
    default: 'succeeded', // 'initiated', 'pending', 'succeeded', 'failed', 'refunded'
    index: true,
  },
  paymentMethod: {
    type: String,
    default: 'stripe',
  },
  items: {
    type: Array,
    default: [],
  },
  shopName: {
    type: String,
    default: 'TeaLeaf Wholesale',
  },
  shops: {
    type: [String],
    default: [],
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 30,
  },
  platformFee: {
    type: Number,
    default: 12,
  },
  customerDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  receiptUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
