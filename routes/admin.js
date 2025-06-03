const ensureAdmin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');



router.get('/orders', ensureAdmin, async (req, res) => {
  const orders = await Order.find()
    .populate('user')
    .populate('products.product')
    .sort({ createdAt: -1 });

  res.render('admin/adminOrders', { title: 'Admin Orders', orders });
});



//Admin Order Management
router.get('/admin/orders', async (req, res) => {
  const orders = await Order.find().populate('user').populate('product').sort({ createdAt: -1 });
  res.render('admin/admin_dashboard', { title: 'Admin Dashboard', orders });
});

//Admin payment confirmation
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('products.product') // ✅ Correct nested populate
      .sort({ createdAt: -1 });

    res.render('admin/adminOrders', {
      title: 'Admin Orders',
      orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load orders');
  }
});


router.post('/orders/:id/confirm', async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate(orderId, {
      status: 'Order Confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    res.redirect('/admin/orders');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Display form to add a new product
router.get('/products/new', ensureAdmin, (req, res) => {
  res.render('admin/new-product');
});

// Uploading New Product picture
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


//Handle new product creation
router.post('/products', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price } = req.body;
    
    if (!req.file) {
      return res.status(400).send('Please upload an image');
    }

    const image = '/uploads/' + req.file.filename;
    const product = new Product({ 
      name, 
      description, 
      category, 
      price: parseFloat(price), 
      image 
    });

    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).send('Error creating product: ' + err.message);
  }
});

// Display form to edit a product
router.get('/products/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('admin/edit-product', { product });
  } catch (err) {
    res.status(500).send('Error fetching product');
  }
});

// Handle product update
router.post('/products/:id', ensureAdmin, async (req, res) => {
  try {
    const { name, description, category, price, image } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, description, category, price, image });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Error updating product');
  }
});

// Handle product deletion
router.post('/products/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Error deleting product');
  }
});

// List all products
router.get('/products', ensureAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', { products });
  } catch (err) {
    res.status(500).send('Error fetching products');
  }
});

module.exports = router;
