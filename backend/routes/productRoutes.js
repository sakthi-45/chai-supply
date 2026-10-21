const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

// GET /api/products - Fetch all products (with optional category and search filters)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: 1 });
    const formatted = products.map((p) => (p.toClient ? p.toClient() : p));
    res.json({ products: formatted });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', products: [] });
  }
});

// GET /api/products/:id - Fetch single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findOne({ productId: id });
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: product.toClient ? product.toClient() : product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create a new product (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      stock,
      image,
      min,
      moq,
      tag,
      badge,
      detail,
      tint,
      id,
      productId,
    } = req.body || {};

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    let assignedProductId = productId || id || `prod-${Date.now()}`;
    const existing = await Product.findOne({ productId: assignedProductId });
    if (existing) {
      assignedProductId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const assignedShop = (req.body.shopName || detail || 'Sunrise Snacks').trim();

    const newProduct = new Product({
      productId: assignedProductId,
      name: name.trim(),
      description: (description || '').trim(),
      category: category || 'Tea ingredients',
      price: Number(price) || 0,
      unit: unit || 'kg',
      stock: stock || 'In stock',
      image: image || '📦',
      min: min || moq || '1 kg',
      moq: moq || min || '1 kg',
      tag: tag || badge || 'Fresh arrival',
      badge: badge || tag || 'Fresh arrival',
      detail: assignedShop,
      shopName: assignedShop,
      tint: tint || 'peach',
    });

    await newProduct.save();
    console.log(
      `[DB] Product created in database: "${newProduct.name}" (ID: ${newProduct.productId}, Shop: ${newProduct.shopName}, Price: ₹${newProduct.price})`
    );

    res.status(201).json({
      success: true,
      product: newProduct.toClient ? newProduct.toClient() : newProduct,
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Strip immutable fields so MongoDB doesn't reject the update
    delete updateData._id;
    delete updateData.__v;
    delete updateData.id;

    // Synchronize aliases
    if (updateData.min && !updateData.moq) updateData.moq = updateData.min;
    if (updateData.moq && !updateData.min) updateData.min = updateData.moq;
    if (updateData.tag && !updateData.badge) updateData.badge = updateData.tag;
    if (updateData.badge && !updateData.tag) updateData.tag = updateData.badge;
    if (updateData.shopName && !updateData.detail) updateData.detail = updateData.shopName;
    if (updateData.detail && !updateData.shopName) updateData.shopName = updateData.detail;
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);

    let updated = await Product.findOneAndUpdate(
      { productId: id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updated && mongoose.Types.ObjectId.isValid(id)) {
      updated = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after' }
      );
    }

    if (!updated) {
      return res.status(404).json({ error: 'Product not found to update' });
    }

    console.log(
      `[DB] Product updated in database: "${updated.name}" (ID: ${updated.productId}, Price: ₹${updated.price})`
    );

    res.json({
      success: true,
      product: updated.toClient ? updated.toClient() : updated,
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = await Product.findOneAndDelete({ productId: id });
    if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found to delete' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      id,
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

module.exports = router;
