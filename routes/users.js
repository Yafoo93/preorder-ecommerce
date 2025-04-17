const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/product');

// Signup form
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Signup' });
});

// Handle signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const user = new User({ fullName, email, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/');
  } catch (err) {
    res.send('Signup failed: ' + err.message);
  }
});

// Login form
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.send('Invalid email or password');
  }
  req.session.userId = user._id;
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });  

  // Add to cart
router.post('/cart/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
  
    const user = await User.findById(req.session.userId);
    if (!user.cart.includes(req.params.id)) {
      user.cart.push(req.params.id);
      await user.save();
    }
    res.redirect('back');
  });
  
  // Add to wishlist
router.post('/wishlist/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
  
    const user = await User.findById(req.session.userId);
    if (!user.wishlist.includes(req.params.id)) {
      user.wishlist.push(req.params.id);
      await user.save();
    }
    res.redirect('back');
  });
  
  // View cart
router.get('/cart', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
  
    const user = await User.findById(req.session.userId).populate('cart');
    res.render('cart', { title: 'Your Cart', products: user.cart });
  });
  
  // View wishlist
router.get('/wishlist', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
  
    const user = await User.findById(req.session.userId).populate('wishlist');
    res.render('wishlist', { title: 'Your Wishlist', products: user.wishlist });
  });

// Add to cart via AJAX
router.post('/api/cart/:id', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Login required' });

  const user = await User.findById(req.session.userId);
  if (!user.cart.includes(req.params.id)) {
    user.cart.push(req.params.id);
    await user.save();
  }

  req.session.cartCount = user.cart.length;
  res.json({ cartCount: user.cart.length });
});

// Add to wishlist via AJAX
router.post('/api/wishlist/:id', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Login required' });

  const user = await User.findById(req.session.userId);
  if (!user.wishlist.includes(req.params.id)) {
    user.wishlist.push(req.params.id);
    await user.save();
  }

  req.session.wishlistCount = user.wishlist.length;
  res.json({ wishlistCount: user.wishlist.length });
});

module.exports = router;
