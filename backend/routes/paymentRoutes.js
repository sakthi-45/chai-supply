const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { detectItemShop, normalizeShop } = require('./orderRoutes');

function getStripeInstance() {
  const stripeSecretKey = (
    process.env.STRIPE_SECRET_KEY ||
    process.env.stripe_secret ||
    process.env.STRIPE_SECRET ||
    process.env[' stripe_secret'] ||
    ''
  ).trim();
  if (!stripeSecretKey) return null;
  return require('stripe')(stripeSecretKey);
}

// POST /create-checkout-session & /api/create-checkout-session
const createCheckoutSessionHandler = async (req, res) => {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(500).json({
        error:
          'Stripe secret key is not configured. Please add STRIPE_SECRET_KEY to your backend .env file.',
      });
    }

    const {
      products,
      currency,
      userId,
      buyer,
      buyerName,
      buyerEmail,
      subtotal,
      deliveryFee,
      platformFee,
      total,
      shopName,
      shops,
    } = req.body || {};

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided for checkout' });
    }

    const clientUrl =
      req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

    const selectedCurrency = (currency || process.env.STRIPE_CURRENCY || 'inr').toLowerCase();
    const effectiveBuyer = buyerName || buyer || 'Wholesale Buyer';
    const effectiveEmail = (buyerEmail || '').trim();
    const effectiveUserId = (userId || '').trim();

    const formattedItems = products.map((product) => {
      const detected = detectItemShop ? detectItemShop(product) : 'TeaLeaf Wholesale';
      const itemShop =
        product.shopName && product.shopName !== 'ChaiSupply Wholesale'
          ? (normalizeShop ? normalizeShop(product.shopName) : product.shopName)
          : detected;

      return {
        id: product.id,
        name: product.name || 'Wholesale Product',
        quantity: Math.max(1, Number(product.quantity) || 1),
        price: Number(product.price) || 0,
        unit: product.unit || 'unit',
        category: product.category || '',
        shopName: itemShop,
        detail: itemShop,
        image: product.image || '',
      };
    });

    const itemShops = Array.from(new Set(formattedItems.map((i) => i.shopName).filter(Boolean)));
    const inputShops = Array.isArray(shops) ? (normalizeShop ? shops.map(normalizeShop) : shops) : [];
    const combinedShops = Array.from(new Set([...inputShops, ...itemShops]));
    const assignedShops = combinedShops.length ? combinedShops : ['TeaLeaf Wholesale'];
    const assignedShopName = shopName
      ? (normalizeShop ? normalizeShop(shopName) : shopName)
      : assignedShops[0] || 'TeaLeaf Wholesale';

    const calcSubtotal =
      subtotal !== undefined
        ? Number(subtotal)
        : formattedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const calcDelivery = deliveryFee !== undefined ? Number(deliveryFee) : 30;
    const calcPlatform = platformFee !== undefined ? Number(platformFee) : 12;
    const calcTotal = total !== undefined ? Number(total) : calcSubtotal + calcDelivery + calcPlatform;

    const orderId = `CS-${Date.now().toString().slice(-6)}`;
    const paymentId = `PAY-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Line items for Stripe Checkout
    const lineItems = formattedItems.map((product) => {
      const isValidImageUrl =
        typeof product.image === 'string' &&
        (product.image.startsWith('http://') || product.image.startsWith('https://'));

      return {
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: product.name || 'Wholesale Product',
            ...(isValidImageUrl ? { images: [product.image] } : {}),
            metadata: {
              shopName: product.shopName,
              productId: String(product.id),
            },
          },
          unit_amount: Math.round(Number(product.price || 0) * 100),
        },
        quantity: Math.max(1, Number(product.quantity) || 1),
      };
    });

    // Add Delivery & Platform fees as a transparent line item in Stripe
    const totalFees = calcDelivery + calcPlatform;
    if (totalFees > 0) {
      lineItems.push({
        price_data: {
          currency: selectedCurrency,
          product_data: {
            name: 'Wholesale Delivery & Platform Fee',
            description: `Delivery (₹${calcDelivery}) + Platform Support (₹${calcPlatform})`,
          },
          unit_amount: Math.round(totalFees * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${clientUrl}/buyer/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/buyer/cart?payment=cancelled`,
      client_reference_id: effectiveUserId || undefined,
      metadata: {
        orderId,
        paymentId,
        userId: String(effectiveUserId || ''),
        buyerName: String(effectiveBuyer).slice(0, 100),
        buyerEmail: String(effectiveEmail).slice(0, 100),
        shopName: String(assignedShopName).slice(0, 100),
        itemCount: String(formattedItems.length),
        total: String(calcTotal),
      },
    };

    if (effectiveEmail && effectiveEmail.includes('@')) {
      sessionParams.customer_email = effectiveEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Save provisional Payment document into MongoDB with status: 'initiated'
    try {
      await Payment.create({
        paymentId,
        stripeSessionId: session.id,
        orderId,
        userId: effectiveUserId,
        buyerName: effectiveBuyer,
        buyerEmail: effectiveEmail,
        amount: calcTotal,
        currency: selectedCurrency,
        status: 'initiated',
        paymentMethod: 'stripe',
        items: formattedItems,
        shopName: assignedShopName,
        shops: assignedShops,
        subtotal: calcSubtotal,
        deliveryFee: calcDelivery,
        platformFee: calcPlatform,
        metadata: {
          stripeSessionUrl: session.url,
          clientUrl,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[MongoDB] Initialized Stripe Payment record ${paymentId} for session ${session.id}`);
    } catch (savePaymentErr) {
      console.warn('[MongoDB] Warning: Could not create provisional Payment record:', savePaymentErr.message);
    }

    // Save provisional Order into MongoDB with paymentStatus: 'Pending'
    try {
      await Order.create({
        orderId,
        userId: effectiveUserId,
        buyer: effectiveBuyer,
        buyerEmail: effectiveEmail,
        shopName: assignedShopName,
        shops: assignedShops,
        items: formattedItems,
        subtotal: calcSubtotal,
        deliveryFee: calcDelivery,
        platformFee: calcPlatform,
        total: calcTotal,
        status: 'Processing',
        paymentStatus: 'Pending',
        paymentMethod: 'Stripe',
        stripeSessionId: session.id,
        paymentId,
        createdAt: new Date(),
      });
      console.log(`[MongoDB] Initialized Order ${orderId} linked to Stripe session ${session.id}`);
    } catch (saveOrderErr) {
      console.warn('[MongoDB] Warning: Could not create provisional Order:', saveOrderErr.message);
    }

    res.json({ id: session.id, url: session.url, orderId, paymentId });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Stripe checkout session' });
  }
};

router.post('/create-checkout-session', createCheckoutSessionHandler);
router.post('/api/create-checkout-session', createCheckoutSessionHandler);

// Helper function to verify and persist payment in MongoDB
async function processSuccessfulPayment(sessionId) {
  const stripe = getStripeInstance();
  if (!stripe) throw new Error('Stripe is not configured');

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });

  const isPaid = session.payment_status === 'paid' || session.status === 'complete';
  if (!isPaid) {
    return {
      success: false,
      isPaid: false,
      status: session.payment_status,
      message: 'Payment has not been completed yet',
    };
  }

  const stripePaymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || '';

  const buyerEmail =
    session.customer_details?.email || session.customer_email || session.metadata?.buyerEmail || '';
  const buyerName =
    session.customer_details?.name || session.metadata?.buyerName || 'Wholesale Buyer';
  const userId = session.client_reference_id || session.metadata?.userId || '';
  const orderId = session.metadata?.orderId || `CS-${sessionId.slice(-6)}`;
  const paymentId = session.metadata?.paymentId || `PAY-${sessionId.slice(-8)}`;
  const shopName = session.metadata?.shopName || 'TeaLeaf Wholesale';
  const amountTotal = session.amount_total ? session.amount_total / 100 : Number(session.metadata?.total || 0);

  // 1. Persist or Update Payment record in MongoDB
  let paymentRecord = await Payment.findOne({ stripeSessionId: sessionId });

  if (paymentRecord) {
    paymentRecord.status = 'succeeded';
    paymentRecord.stripePaymentIntentId = stripePaymentIntentId || paymentRecord.stripePaymentIntentId;
    if (buyerEmail) paymentRecord.buyerEmail = buyerEmail;
    if (buyerName && buyerName !== 'Wholesale Buyer') paymentRecord.buyerName = buyerName;
    if (userId) paymentRecord.userId = userId;
    if (session.customer_details) paymentRecord.customerDetails = session.customer_details;
    paymentRecord.updatedAt = new Date();
    await paymentRecord.save();
    console.log(`[MongoDB] Updated existing Payment record ${paymentRecord.paymentId} to succeeded.`);
  } else {
    // Payment record wasn't created at session start; create it now
    paymentRecord = await Payment.create({
      paymentId,
      stripeSessionId: sessionId,
      stripePaymentIntentId,
      orderId,
      userId,
      buyerName,
      buyerEmail,
      amount: amountTotal,
      currency: session.currency || 'inr',
      status: 'succeeded',
      paymentMethod: 'stripe',
      shopName,
      shops: [shopName],
      customerDetails: session.customer_details || {},
      metadata: session.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[MongoDB] Created new Payment record ${paymentId} in database.`);
  }

  // 2. Persist or Update Order record in MongoDB
  let orderRecord = await Order.findOne({
    $or: [{ stripeSessionId: sessionId }, { orderId }],
  });

  if (orderRecord) {
    orderRecord.paymentStatus = 'Paid';
    orderRecord.paymentMethod = 'Stripe';
    orderRecord.stripeSessionId = sessionId;
    if (stripePaymentIntentId) orderRecord.stripePaymentIntentId = stripePaymentIntentId;
    if (paymentRecord.paymentId) orderRecord.paymentId = paymentRecord.paymentId;
    if (buyerEmail && !orderRecord.buyerEmail) orderRecord.buyerEmail = buyerEmail;
    if (buyerName && (!orderRecord.buyer || orderRecord.buyer === 'Tea Shop Owner')) {
      orderRecord.buyer = buyerName;
    }
    await orderRecord.save();
    console.log(`[MongoDB] Order ${orderRecord.orderId} marked as Paid via Stripe.`);
  } else {
    // If order was not created during session initialization, create it now
    orderRecord = await Order.create({
      orderId,
      userId,
      buyer: buyerName,
      buyerEmail,
      shopName,
      shops: [shopName],
      items: paymentRecord.items || [],
      subtotal: paymentRecord.subtotal || amountTotal,
      deliveryFee: paymentRecord.deliveryFee || 30,
      platformFee: paymentRecord.platformFee || 12,
      total: amountTotal,
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod: 'Stripe',
      stripeSessionId: sessionId,
      stripePaymentIntentId,
      paymentId: paymentRecord.paymentId,
      createdAt: new Date(),
    });
    console.log(`[MongoDB] Created fresh Order ${orderId} marked as Paid via Stripe.`);
  }

  return {
    success: true,
    isPaid: true,
    payment: paymentRecord,
    order: orderRecord,
  };
}

// GET & POST /verify-session and /api/verify-session
// When user returns from Stripe checkout, this endpoint confirms payment and updates MongoDB
const verifyHandler = async (req, res) => {
  try {
    const sessionId = (req.query.session_id || req.body?.session_id || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session_id parameter' });
    }

    const result = await processSuccessfulPayment(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Verify Stripe Session Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to verify Stripe payment session',
    });
  }
};

router.get('/verify-session', verifyHandler);
router.post('/verify-session', verifyHandler);
router.get('/api/verify-session', verifyHandler);
router.post('/api/verify-session', verifyHandler);

// Auto-sync helper: guarantees every order in database has a corresponding Payment record
async function syncMissingOrdersToPayments() {
  try {
    const orders = await Order.find();
    if (!orders || !orders.length) return;

    for (const o of orders) {
      const existing = await Payment.findOne({ orderId: o.orderId });
      if (!existing) {
        const rawMethod = String(o.paymentMethod || '').toLowerCase();
        const isStripe = rawMethod.includes('stripe');
        const method = isStripe ? 'Stripe' : 'Pay on Drop';
        const isPaid = o.paymentStatus === 'Paid' || (isStripe && o.status !== 'Cancelled');
        const pId =
          o.paymentId ||
          `PAY-${isStripe ? 'STRIPE' : 'POD'}-${o.orderId ? o.orderId.replace('CS-', '') : Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

        await Payment.create({
          paymentId: pId,
          stripeSessionId: o.stripeSessionId || '',
          stripePaymentIntentId: o.stripePaymentIntentId || '',
          orderId: o.orderId,
          userId: o.userId || '',
          buyerName: o.buyer || 'Wholesale Buyer',
          buyerEmail: o.buyerEmail || '',
          amount: Number(o.total) || 0,
          currency: 'inr',
          status: isPaid ? 'succeeded' : 'pending',
          paymentMethod: method,
          items: o.items || [],
          shopName: o.shopName || 'TeaLeaf Wholesale',
          shops: o.shops || [o.shopName || 'TeaLeaf Wholesale'],
          subtotal: o.subtotal || o.total || 0,
          deliveryFee: o.deliveryFee !== undefined ? o.deliveryFee : 30,
          platformFee: o.platformFee !== undefined ? o.platformFee : 12,
          createdAt: o.createdAt || new Date(),
          updatedAt: o.createdAt || new Date(),
        });
      }
    }
  } catch (err) {
    console.warn('[Sync] Could not auto-sync orders to payments:', err.message);
  }
}

// GET /payments and /api/payments - Stored payment records for Admin
const getPaymentsHandler = async (req, res) => {
  try {
    await syncMissingOrdersToPayments();
    const { shop, search, status, method } = req.query;
    const query = {};

    if (status && status !== 'All') {
      if (status.toLowerCase() === 'paid' || status.toLowerCase() === 'succeeded') {
        query.status = 'succeeded';
      } else if (status.toLowerCase() === 'due' || status.toLowerCase() === 'pending') {
        query.status = { $in: ['pending', 'initiated'] };
      } else {
        query.status = status;
      }
    }

    if (method && method !== 'All') {
      if (method.toLowerCase().includes('stripe')) {
        query.paymentMethod = { $regex: /stripe/i };
      } else if (method.toLowerCase().includes('drop') || method.toLowerCase().includes('cod')) {
        query.paymentMethod = { $regex: /drop|cod|delivery/i };
      } else {
        query.paymentMethod = method;
      }
    }

    if (shop && shop !== 'All') {
      const cleanShop = String(shop).trim();
      const normShop = normalizeShop ? normalizeShop(cleanShop) : cleanShop;
      query.$or = [
        { shopName: cleanShop },
        { shopName: normShop },
        { shops: cleanShop },
        { shops: normShop },
        { 'items.shopName': cleanShop },
        { 'items.shopName': normShop },
      ];
    }

    if (search && search.trim()) {
      const s = search.trim();
      const sRegex = new RegExp(s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      const searchConditions = [
        { paymentId: sRegex },
        { stripeSessionId: sRegex },
        { stripePaymentIntentId: sRegex },
        { orderId: sRegex },
        { buyerName: sRegex },
        { buyerEmail: sRegex },
        { userId: sRegex },
        { paymentMethod: sRegex },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const stripePayments = payments.filter((p) =>
      String(p.paymentMethod || '').toLowerCase().includes('stripe')
    );
    const stripeRevenue = stripePayments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const podPayments = payments.filter((p) =>
      !String(p.paymentMethod || '').toLowerCase().includes('stripe')
    );
    const podCollected = podPayments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const podPending = podPayments
      .filter((p) => p.status !== 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const formattedPayments = payments.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      const isStripe = String(doc.paymentMethod || '').toLowerCase().includes('stripe');
      const standardizedMethod = isStripe ? 'Stripe' : 'Pay on Drop';

      return {
        id: doc.paymentId || (doc._id ? doc._id.toString() : ''),
        paymentId: doc.paymentId || '',
        stripeSessionId: doc.stripeSessionId || '',
        stripePaymentIntentId: doc.stripePaymentIntentId || '',
        orderId: doc.orderId || '',
        userId: doc.userId || '',
        buyerName: doc.buyerName || 'Wholesale Buyer',
        buyerEmail: doc.buyerEmail || '',
        amount: Number(doc.amount) || 0,
        currency: (doc.currency || 'inr').toUpperCase(),
        status: doc.status || (isStripe ? 'succeeded' : 'pending'),
        paymentMethod: standardizedMethod,
        isStripe,
        isPayOnDrop: !isStripe,
        items: Array.isArray(doc.items) ? doc.items : [],
        itemCount: Array.isArray(doc.items) ? doc.items.length : 0,
        shopName: doc.shopName || 'TeaLeaf Wholesale',
        shops: doc.shops || [],
        subtotal: doc.subtotal || 0,
        deliveryFee: doc.deliveryFee || 0,
        platformFee: doc.platformFee || 0,
        customerDetails: doc.customerDetails || {},
        date: doc.createdAt
          ? new Intl.DateTimeFormat('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(doc.createdAt))
          : 'Recent',
        createdAt: doc.createdAt,
      };
    });

    res.json({
      success: true,
      count: formattedPayments.length,
      totalRevenue,
      stripeRevenue,
      stripeCount: stripePayments.length,
      payOnDropCount: podPayments.length,
      payOnDropCollected: podCollected,
      payOnDropPending: podPending,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, payments: [], error: 'Failed to fetch payments' });
  }
};

router.get('/payments', getPaymentsHandler);
router.get('/api/payments', getPaymentsHandler);

// PATCH /payments/:id/collect & /api/payments/:id/collect - Mark Pay on Drop as collected
const collectPaymentHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findOne({
      $or: [{ paymentId: id }, { orderId: id }],
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.status = 'succeeded';
    payment.updatedAt = new Date();
    await payment.save();

    if (payment.orderId) {
      await Order.updateOne(
        { orderId: payment.orderId },
        { $set: { paymentStatus: 'Paid' } }
      );
    }

    res.json({ success: true, message: 'Payment marked as collected / paid', payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment collection status' });
  }
};

router.patch('/payments/:id/collect', collectPaymentHandler);
router.patch('/api/payments/:id/collect', collectPaymentHandler);

// GET /payments/:id - Fetch single payment details
router.get('/payments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.findOne({
      $or: [{ paymentId: id }, { stripeSessionId: id }, { orderId: id }],
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve payment details' });
  }
});

// POST /webhook & /api/webhook - Stripe webhook listener
const webhookHandler = async (req, res) => {
  try {
    const event = req.body;
    if (event && event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      if (session?.id) {
        console.log('[Stripe Webhook] Received checkout.session.completed for', session.id);
        await processSuccessfulPayment(session.id);
      }
    } else if (event && event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data?.object;
      if (paymentIntent?.id) {
        console.log('[Stripe Webhook] Received payment_intent.succeeded for', paymentIntent.id);
        await Payment.updateOne(
          { stripePaymentIntentId: paymentIntent.id },
          { $set: { status: 'succeeded', updatedAt: new Date() } }
        );
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.warn('[Stripe Webhook] Error processing event:', err.message);
    res.status(400).json({ error: err.message });
  }
};

router.post('/webhook', webhookHandler);
router.post('/api/webhook', webhookHandler);

module.exports = router;
module.exports.syncMissingOrdersToPayments = syncMissingOrdersToPayments;
