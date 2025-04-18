const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/User');

//Admin Order Management
router.get('/admin/orders', async (req, res) => {
  const orders = await Order.find().populate('user').populate('product').sort({ createdAt: -1 });
  res.render('admin/admin_dashboard', { title: 'Admin Dashboard', orders });
});

//Admin payment confirmation
router.get('/admin/orders', async (req, res) => {
  const orders = await Order.find().populate('user');
  res.render('admin/adminOrders', { title: 'Admin Orders', orders });
});

router.post('/admin/orders/:id/confirm', async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: 'Confirmed' });
  res.redirect('/admin/orders');
});


module.exports = router;
