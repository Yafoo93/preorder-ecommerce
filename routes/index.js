const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const ensureAuth = require('../middleware/auth');
const Order = require('../models/order');

router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render('index', { title: 'Welcome to My King Preorder Store', products });
});

router.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');
  res.render('product', {
    title: product.name,
    product,
    session: req.session
  });
});

router.post('/preorder/:id', ensureAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('Product not found');

  await Order.create({
    userId: req.session.userId,
    productId: product._id
  });
  res.send(`Thanks for preordering: ${product.name}`);
});

router.get('/search', async (req, res) => {
    const query = req.query.q.trim();
    const regex = new RegExp(query, 'i'); // Case-insensitive
  
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex },
        { _id: query.length === 24 ? query : undefined } // Optional match by ID if format is valid
      ]
    });
  
    res.render('index', {
      title: `Search Results for "${query}"`,
      products
    });
  });
  


module.exports = router;
