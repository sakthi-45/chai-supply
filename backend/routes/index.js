const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const paymentRoutes = require('./paymentRoutes');

// Mount sub-routers on /api
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/', paymentRoutes);

module.exports = router;
module.exports.productRoutes = productRoutes;
module.exports.orderRoutes = orderRoutes;
module.exports.authRoutes = authRoutes;
module.exports.chatRoutes = chatRoutes;
module.exports.paymentRoutes = paymentRoutes;
