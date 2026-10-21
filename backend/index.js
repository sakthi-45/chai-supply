require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const initialProducts = require('./data/initialProducts');
const apiRoutes = require('./routes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://chai-supply-tvol.vercel.app',
    'https://chai-supply-xxcc.vercel.app' // <-- Added your active frontend URL
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://sakthivelmurugadass_db_user:Zk3lIVvum0mZgtaC@ac-bv5r4sm-shard-00-00.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-01.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-02.tujqh9g.mongodb.net:27017/?ssl=true&replicaSet=atlas-o7r1zb-shard-0&authSource=admin&appName=Cluster0FF';

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      // Ensure all initial catalog products are present in MongoDB without overwriting existing data
      const ops = initialProducts.map((prod) => ({
        updateOne: {
          filter: { productId: prod.productId },
          update: { $setOnInsert: prod },
          upsert: true,
        },
      }));
      await Product.bulkWrite(ops);
      const totalCount = await Product.countDocuments();
      console.log(`MongoDB catalog verified. ${totalCount} total products ready in database.`);

      // Categorize products by shop names (aligned with frontend's 3 stores)
      const shopCategoryMap = {
        'Milk & dairy': 'Fresh Farm Dairy',
        Snacks: 'Sunrise Snacks',
        'Tea ingredients': 'TeaLeaf Wholesale',
        Packaging: 'TeaLeaf Wholesale',
        'Cleaning & hygiene': 'TeaLeaf Wholesale',
      };
      const unassigned = await Product.find({
        $or: [
          { shopName: { $exists: false } },
          { shopName: 'ChaiSupply Wholesale' },
          { shopName: 'FreshFarm Dairy' },
          { shopName: 'CityPack Supplies' },
          { shopName: '' },
        ],
      });
      if (unassigned.length > 0) {
        for (const p of unassigned) {
          const shop = shopCategoryMap[p.category] || 'TeaLeaf Wholesale';
          await Product.updateOne({ _id: p._id }, { $set: { shopName: shop, detail: shop } });
        }
        console.log(`Assigned category-specific shop names to ${unassigned.length} catalog products.`);
      }
      // Auto-sync all database orders to ensure each has a Payment record
      if (paymentRoutes.syncMissingOrdersToPayments) {
        await paymentRoutes.syncMissingOrdersToPayments();
        console.log('MongoDB orders & payments synchronization verified.');
      }
    } catch (seedErr) {
      console.warn('Auto-seed check error:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Root Health Check Endpoint
app.get('/', (req, res) => {
  res.send('ChaiSupply Backend API Running');
});

// Mount API Routes
app.use('/api', apiRoutes);
app.use(paymentRoutes); // Root-level fallback for /create-checkout-session

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
