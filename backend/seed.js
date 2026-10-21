require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const initialProducts = require('./data/initialProducts');

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://sakthivelmurugadass_db_user:Zk3lIVvum0mZgtaC@ac-bv5r4sm-shard-00-00.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-01.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-02.tujqh9g.mongodb.net:27017/?ssl=true&replicaSet=atlas-o7r1zb-shard-0&authSource=admin&appName=Cluster0FF';

async function seedDatabase() {
  console.log('--- ChaiSupply Database Seeder ---');
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    let upsertedCount = 0;
    for (const prod of initialProducts) {
      await Product.findOneAndUpdate(
        { productId: prod.productId },
        { $set: prod },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      upsertedCount++;
    }

    const totalInDb = await Product.countDocuments();
    console.log(`Successfully seeded ${upsertedCount} catalog products.`);
    console.log(`Total products currently in MongoDB: ${totalInDb}`);
    console.log('--- Seeding completed successfully! ---');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();
