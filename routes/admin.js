const ensureAdmin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/User');
const { ensureAdmin } = require('../middleware/auth');



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


module.exports = router;
