const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/product');
const upload = require('../middleware/upload');
const Order = require('../models/order');
const { sendWelcomeEmail } = require('../utils/mailer');
const { sendPaymentReceivedEmail } = require('../utils/mailer');




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

    // 🔔 Send welcome email
    await sendWelcomeEmail(email, fullName);

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

router.post('/logout', (req, res) => {
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

// Remove from cart
router.post('/cart/remove/:id', async (req, res) => {
  const user = await User.findById(req.session.userId);
  user.cart = user.cart.filter(item => item.toString() !== req.params.id);
  await user.save();
  req.session.cartCount = user.cart.length;
  res.redirect('/cart');
});

// Remove from wishlist
router.post('/wishlist/remove/:id', async (req, res) => {
  const user = await User.findById(req.session.userId);
  user.wishlist = user.wishlist.filter(item => item.toString() !== req.params.id);
  await user.save();
  req.session.wishlistCount = user.wishlist.length;
  res.redirect('/wishlist');
});

//checkout route

router.get('/checkout', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId).populate('cart');
  const total = user.cart.reduce((sum, item) => sum + item.price, 0);

  res.render('checkout', {
    title: 'Checkout',
    total
  });
});


router.post('/checkout', upload.single('paymentProof'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate('cart');

    if (!user.cart.length) {
      return res.status(400).send('Your cart is empty.');
    }

    const products = user.cart.map(item => ({
      product: item._id,
      quantity: 1, 
      price: item.price,
    }));

    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      user: userId,
      products,
      totalAmount,
      paymentProof: req.file.filename,
      estimatedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
    });

    await newOrder.save();
    await sendPaymentReceivedEmail(user.email, newOrder._id);


    // Clear user's cart
    user.cart = [];
    await user.save();

    // Reset session cart count
    req.session.cartCount = 0;
    res.locals.session.cartCount = 0;

    res.send('Payment made, awaiting confirmation.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

//User profile
router.get('/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId)
    .populate('cart')
    .populate('wishlist');

  const orders = await Order.find({ user: user._id })
    .populate('products.product')
    .sort({ createdAt: -1 });

  res.render('users/profile', {
    title: 'Your Profile',
    user,
    orders,
    cart: user.cart,
    wishlist: user.wishlist
  });
});

// Edit profile form
router.get('/profile/edit', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId);
  res.render('users/edit-profile', { title: 'Edit Profile', user });
});

// Update profile
router.post('/profile/edit', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findById(req.session.userId);
    const { fullName, email, phoneNumber, address, currentPassword, newPassword, confirmPassword } = req.body;

    // Update basic info
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.address = address;

    // Handle password change if provided
    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        return res.send('New passwords do not match');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.send('Current password is incorrect');
      }

      user.password = newPassword;
    }

    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating profile');
  }
});




module.exports = router;
