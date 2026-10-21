const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    stock: {
      type: String,
      default: 'In stock',
      trim: true,
    },
    image: {
      type: String,
      default: '📦',
      trim: true,
    },
    min: {
      type: String,
      default: '1 kg',
      trim: true,
    },
    moq: {
      type: String,
      default: '1 kg',
      trim: true,
    },
    tag: {
      type: String,
      default: 'Fresh arrival',
      trim: true,
    },
    badge: {
      type: String,
      default: 'Fresh arrival',
      trim: true,
    },
    detail: {
      type: String,
      default: 'Wholesale Chai Supply',
      trim: true,
    },
    tint: {
      type: String,
      default: 'peach',
      trim: true,
    },
    shopName: {
      type: String,
      default: 'ChaiSupply Wholesale',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Synchronize MOQ <-> min, badge <-> tag, and shopName <-> detail
productSchema.pre('save', function () {
  if (this.moq && !this.min) this.min = this.moq;
  if (this.min && !this.moq) this.moq = this.min;
  if (this.badge && !this.tag) this.tag = this.badge;
  if (this.tag && !this.badge) this.badge = this.tag;
  if (this.shopName && (!this.detail || this.detail === 'Wholesale Chai Supply')) {
    this.detail = this.shopName;
  }
  if (this.detail && (!this.shopName || this.shopName === 'ChaiSupply Wholesale')) {
    this.shopName = this.detail;
  }
  if (!this.productId) {
    this.productId = this._id ? this._id.toString() : `prod-${Date.now()}`;
  }
});

productSchema.methods.toClient = function () {
  const obj = this.toObject();
  return {
    id: obj.productId || obj._id.toString(),
    productId: obj.productId,
    _id: obj._id,
    name: obj.name,
    description: obj.description,
    category: obj.category,
    price: obj.price,
    unit: obj.unit,
    stock: obj.stock,
    image: obj.image,
    min: obj.min || obj.moq,
    moq: obj.moq || obj.min,
    tag: obj.tag || obj.badge,
    badge: obj.badge || obj.tag,
    detail: obj.detail || obj.shopName || 'Wholesale Chai Supply',
    shopName: obj.shopName || obj.detail || 'ChaiSupply Wholesale',
    tint: obj.tint,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
