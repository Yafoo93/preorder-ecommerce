const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

router.get('/admin/orders', async (req, res) => {
  const orders = await Order.find().populate('userId').populate('productId').sort({ createdAt: -1 });
  res.render('admin/admin_dashboard', { title: 'Admin Dashboard', orders });
});

module.exports = router;
