const express = require('express');
const router = express.Router();
const User = require('../models/user');

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

module.exports = router;
