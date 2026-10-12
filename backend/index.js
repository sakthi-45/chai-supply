const express = require('express');
const nodemon = require('nodemon');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect("mongodb://sakthivelmurugadass_db_user:Zk3lIVvum0mZgtaC@ac-bv5r4sm-shard-00-00.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-01.tujqh9g.mongodb.net:27017,ac-bv5r4sm-shard-00-02.tujqh9g.mongodb.net:27017/?ssl=true&replicaSet=atlas-o7r1zb-shard-0&authSource=admin&appName=Cluster0FF")
.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});