const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');

function detectItemShop(item) {
  if (!item) return 'TeaLeaf Wholesale';
  const name = String(item.name || item.id || '').toLowerCase();
  const category = String(item.category || '').toLowerCase();
  const shop = String(item.shopName || item.detail || '').toLowerCase();

  if (
    category.includes('dairy') ||
    category.includes('milk') ||
    shop.includes('fresh') ||
    shop.includes('farm') ||
    shop.includes('dairy') ||
    ['milk', 'butter', 'condensed-milk', 'sliced-cheese', 'oat-milk', 'soy-milk'].includes(item.id) ||
    name.includes('milk') ||
    name.includes('butter') ||
    name.includes('cheese') ||
    name.includes('curd') ||
    name.includes('ghee') ||
    name.includes('paneer')
  ) {
    return 'Fresh Farm Dairy';
  }

  if (
    category.includes('snack') ||
    shop.includes('sunrise') ||
    shop.includes('snack') ||
    ['biscuits', 'samosa', 'rusk', 'khari', 'cake-rusk', 'osmania-biscuits', 'bakery-buns'].includes(item.id) ||
    name.includes('biscuit') ||
    name.includes('samosa') ||
    name.includes('bun') ||
    name.includes('rusk') ||
    name.includes('khari') ||
    name.includes('puff')
  ) {
    return 'Sunrise Snacks';
  }

  return 'TeaLeaf Wholesale';
}

function normalizeShop(s) {
  if (!s) return 'TeaLeaf Wholesale';
  const clean = String(s).toLowerCase().replace(/[\s\-_]+/g, '');
  if (clean.includes('fresh') || clean.includes('dairy') || clean.includes('farm')) {
    return 'Fresh Farm Dairy';
  }
  if (clean.includes('sunrise') || clean.includes('snack')) {
    return 'Sunrise Snacks';
  }
  if (
    clean.includes('tea') ||
    clean.includes('leaf') ||
    clean.includes('wholesale') ||
    clean.includes('pack') ||
    clean.includes('clean') ||
    clean.includes('chaisupply')
  ) {
    return 'TeaLeaf Wholesale';
  }
  return s;
}

// GET /api/orders - Fetch orders (with shop isolation support)
router.get('/', async (req, res) => {
  try {
    const { shop } = req.query;
    let query = {};
    const normShop = shop && shop !== 'All' ? normalizeShop(shop) : null;

    if (normShop) {
      const cleanShop = shop.trim();
      const escaped = cleanShop.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s*');
      const escapedNorm = normShop.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s*');
      const shopRegex = new RegExp(`^${escaped}$`, 'i');
      const normRegex = new RegExp(`^${escapedNorm}$`, 'i');

      query = {
        $or: [
          { shops: cleanShop },
          { shops: normShop },
          { shops: shopRegex },
          { shops: normRegex },
          { shopName: cleanShop },
          { shopName: normShop },
          { shopName: shopRegex },
          { shopName: normRegex },
          { 'items.shopName': cleanShop },
          { 'items.shopName': normShop },
          { 'items.shopName': shopRegex },
          { 'items.shopName': normRegex },
          { 'items.detail': cleanShop },
          { 'items.detail': normShop },
          { 'items.detail': shopRegex },
          { 'items.detail': normRegex },
        ],
      };

      if (normShop === 'Fresh Farm Dairy') {
        query.$or.push(
          { 'items.id': { $in: ['milk', 'butter', 'condensed-milk', 'sliced-cheese', 'oat-milk', 'soy-milk'] } },
          { 'items.name': { $regex: /milk|butter|cheese|curd|ghee|paneer|dairy/i } },
          { 'items.category': { $regex: /dairy|milk/i } }
        );
      } else if (normShop === 'Sunrise Snacks') {
        query.$or.push(
          {
            'items.id': {
              $in: ['biscuits', 'samosa', 'rusk', 'khari', 'cake-rusk', 'osmania-biscuits', 'bakery-buns'],
            },
          },
          { 'items.name': { $regex: /biscuit|samosa|bun|rusk|khari|puff/i } },
          { 'items.category': { $regex: /snack/i } }
        );
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    let formattedOrders = orders.map((o) => {
      const orderObj = o.toObject ? o.toObject() : o;
      const rawItems = Array.isArray(orderObj.items) ? orderObj.items : [];
      let items = rawItems.map((item) => {
        const detected = detectItemShop(item);
        const itemShop =
          item.shopName && item.shopName !== 'ChaiSupply Wholesale' ? normalizeShop(item.shopName) : detected;
        return {
          ...item,
          shopName: itemShop,
          detail: itemShop,
        };
      });

      // When shop is specified (admin querying their store orders), strictly filter items to ONLY their products
      if (normShop) {
        items = items.filter((item) => item.shopName === normShop);
      }

      const itemShops = Array.from(new Set(items.map((i) => i.shopName).filter(Boolean)));
      const rawShops = Array.isArray(orderObj.shops) ? orderObj.shops.map(normalizeShop) : [];
      const combinedShops = normShop ? [normShop] : Array.from(new Set([...rawShops, ...itemShops]));
      const shops = combinedShops.length ? combinedShops : ['TeaLeaf Wholesale'];

      const shopItemsSubtotal = items.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );

      return {
        id: orderObj.orderId || (orderObj._id ? orderObj._id.toString() : ''),
        orderId: orderObj.orderId || '',
        userId: orderObj.userId || '',
        buyer: orderObj.buyer || 'Tea Stall Owner',
        buyerEmail: orderObj.buyerEmail || '',
        date: orderObj.createdAt
          ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
              new Date(orderObj.createdAt)
            )
          : 'Recent',
        status: orderObj.status || 'Processing',
        shopName: normShop || orderObj.shopName || shops[0],
        shops,
        items,
        subtotal: normShop ? shopItemsSubtotal : (orderObj.subtotal || shopItemsSubtotal),
        deliveryFee: orderObj.deliveryFee !== undefined ? orderObj.deliveryFee : 30,
        platformFee: orderObj.platformFee !== undefined ? orderObj.platformFee : 12,
        total: normShop ? shopItemsSubtotal : (orderObj.total || 0),
        fullOrderTotal: orderObj.total || 0,
        paymentStatus: orderObj.paymentStatus || 'Pending',
        paymentMethod: orderObj.paymentMethod || 'Cash on Delivery',
        stripeSessionId: orderObj.stripeSessionId || '',
        stripePaymentIntentId: orderObj.stripePaymentIntentId || '',
        paymentId: orderObj.paymentId || '',
        createdAt: orderObj.createdAt,
      };
    });

    if (normShop) {
      formattedOrders = formattedOrders.filter((o) => o.items.length > 0);
    }

    res.json({ orders: formattedOrders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.json({ orders: [] });
  }
});

// POST /api/orders - Place a new wholesale order
router.post('/', async (req, res) => {
  try {
    const {
      items,
      subtotal,
      deliveryFee,
      platformFee,
      total,
      buyer,
      buyerEmail,
      userId,
      shopName,
      shops,
      paymentStatus,
      paymentMethod,
      stripeSessionId,
      stripePaymentIntentId,
      paymentId,
    } = req.body || {};
    const orderId = req.body.orderId || `CS-${Date.now().toString().slice(-6)}`;
    const calcSubtotal = Number(subtotal) || 0;
    const calcDelivery = deliveryFee !== undefined ? Number(deliveryFee) : 30;
    const calcPlatform = platformFee !== undefined ? Number(platformFee) : 12;
    const calcTotal = Number(total) || (calcSubtotal + calcDelivery + calcPlatform);

    const safeItems = (Array.isArray(items) ? items : []).map((i) => {
      const detected = detectItemShop(i);
      const finalShop =
        i.shopName && i.shopName !== 'ChaiSupply Wholesale' ? normalizeShop(i.shopName) : detected;
      return {
        ...i,
        shopName: finalShop,
        detail: finalShop,
      };
    });

    const itemShops = Array.from(new Set(safeItems.map((i) => i.shopName).filter(Boolean)));
    const inputShops = Array.isArray(shops) ? shops.map(normalizeShop) : [];
    const combinedShops = Array.from(new Set([...inputShops, ...itemShops]));
    const assignedShops = combinedShops.length ? combinedShops : ['ChaiSupply Wholesale'];

    let assignedShopName = shopName ? normalizeShop(shopName) : '';
    if (!assignedShopName || assignedShopName === 'ChaiSupply Wholesale') {
      assignedShopName = assignedShops[0] || 'ChaiSupply Wholesale';
    }

    const rawMethod = String(paymentMethod || '').toLowerCase();
    const normalizedMethod = rawMethod.includes('stripe') ? 'Stripe' : 'Pay on Drop';
    const normalizedStatus =
      paymentStatus || (normalizedMethod === 'Stripe' ? 'Paid' : 'Due on Drop');
    const finalPaymentId =
      paymentId ||
      `PAY-${normalizedMethod === 'Stripe' ? 'STRIPE' : 'POD'}-${orderId.replace('CS-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const newOrder = {
      id: orderId,
      orderId,
      userId: userId || '',
      buyer: buyer || 'Tea Shop Owner',
      buyerEmail: buyerEmail || '',
      date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      status: 'Processing',
      paymentStatus: normalizedStatus,
      paymentMethod: normalizedMethod,
      stripeSessionId: stripeSessionId || '',
      stripePaymentIntentId: stripePaymentIntentId || '',
      paymentId: finalPaymentId,
      shopName: assignedShopName,
      shops: assignedShops,
      items: safeItems,
      subtotal: calcSubtotal,
      deliveryFee: calcDelivery,
      platformFee: calcPlatform,
      total: calcTotal,
      createdAt: new Date(),
    };

    try {
      await Order.create({
        orderId,
        userId: newOrder.userId,
        buyer: newOrder.buyer,
        buyerEmail: newOrder.buyerEmail,
        shopName: newOrder.shopName,
        shops: newOrder.shops,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        deliveryFee: newOrder.deliveryFee,
        platformFee: newOrder.platformFee,
        total: newOrder.total,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        paymentMethod: newOrder.paymentMethod,
        stripeSessionId: newOrder.stripeSessionId,
        stripePaymentIntentId: newOrder.stripePaymentIntentId,
        paymentId: newOrder.paymentId,
        createdAt: newOrder.createdAt,
      });
      console.log(`[MongoDB] Created Order ${orderId} (${normalizedMethod} - ${normalizedStatus})`);
    } catch (saveErr) {
      console.warn('Could not persist order to DB, returning order object:', saveErr.message);
    }

    // ALWAYS store payment record in MongoDB for ALL payment methods (Stripe, Pay on Drop, etc.)
    try {
      await Payment.create({
        paymentId: finalPaymentId,
        stripeSessionId: stripeSessionId || '',
        stripePaymentIntentId: stripePaymentIntentId || '',
        orderId,
        userId: newOrder.userId,
        buyerName: newOrder.buyer,
        buyerEmail: newOrder.buyerEmail,
        amount: calcTotal,
        currency: 'inr',
        status: normalizedStatus === 'Paid' ? 'succeeded' : 'pending',
        paymentMethod: normalizedMethod,
        items: safeItems,
        shopName: assignedShopName,
        shops: assignedShops,
        subtotal: calcSubtotal,
        deliveryFee: calcDelivery,
        platformFee: calcPlatform,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.createdAt,
      });
      console.log(`[MongoDB] Created Payment record ${finalPaymentId} for ${normalizedMethod}`);
    } catch (savePaymentErr) {
      console.warn('[MongoDB] Warning: Could not create Payment record:', savePaymentErr.message);
    }

    res.status(201).json({ order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// PATCH /api/orders/:id - Update order status & sync payment status
router.patch('/:id', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body || {};
    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    // When a Pay on Drop order is marked as Delivered, automatically mark cash as Paid / collected!
    if (status === 'Delivered' && !paymentStatus) {
      const existing = await Order.findOne({ orderId: req.params.id });
      if (existing && existing.paymentMethod === 'Pay on Drop') {
        updateFields.paymentStatus = 'Paid';
      }
    }

    const updated = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      updateFields,
      { returnDocument: 'after' }
    );

    // Sync matching Payment document in MongoDB
    if (updateFields.paymentStatus) {
      const payStatus = updateFields.paymentStatus === 'Paid' ? 'succeeded' : 'pending';
      await Payment.updateOne(
        { orderId: req.params.id },
        { $set: { status: payStatus, updatedAt: new Date() } }
      );
    }

    res.json({ success: true, orderId: req.params.id, status: updated?.status, paymentStatus: updated?.paymentStatus, order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// DELETE /api/orders/:id - Delete / cancel order
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({ orderId: req.params.id });
    res.json({ success: true, deleted: !!deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
module.exports.detectItemShop = detectItemShop;
module.exports.normalizeShop = normalizeShop;
