require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const app = express();
const Product = require('./models/product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session setup
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

// Global session access + cart/wishlist count
app.use(async (req, res, next) => {
  res.locals.session = req.session;

  if (req.session.userId) {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    req.session.cartCount = user.cart.length;
    req.session.wishlistCount = user.wishlist.length;
    res.locals.session.cartCount = user.cart.length;
    res.locals.session.wishlistCount = user.wishlist.length;
  } else {
    req.session.cartCount = 0;
    req.session.wishlistCount = 0;
  }

  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/admin', require('./routes/admin'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({ storage: storage });

// Seed products

async function seedProducts() {

  await Product.insertMany([
    {
      name: 'Smart Watch',
      description: 'Waterproof and fitness-friendly',
      category: 'electronics',
      price: 120,
      image: '/images/military.jpeg',
    },
    {
      name: 'Modern Sofa',
      description: 'Stylish and comfy',
      category: 'furnitures',
      price: 499,
      image: '/images/sofa1.jpeg',
    },
    {
      name: 'iPhone 14 Pro',
      description: 'Latest Apple device preorder',
      category: 'mobile phones',
      price: 999,
      image: '/images/apple1.jpeg',
    },
    {
      name: 'Apple Watch Series 7',
      description: 'Latest Apple Watch preorder',
      category: 'mobile phones',
      price: 999,
      image: '/images/apple.jpeg',
    },
    {
      name: 'Luxury Sofa',
      description: 'Comfortable and stylish seating',
      category: 'furnitures',
      price: 799,
      image: '/images/sofa2.jpeg',
    },
    {
      name: 'PlayStation 5',
      description: 'Next-gen gaming console',
      category: 'toys and games',
      price: 599,
      image: '/images/ps5.jpeg',
    },
    {
      name: 'Running Shoes',
      description: 'Perfect for sports and fitness',
      category: 'sports',
      price: 89,
      image: '/images/shoes.jpeg',
    },
    {
      name: 'Lipstick Set',
      description: 'Vibrant shades for every occasion',
      category: 'beauty and fashion',
      price: 29,
      image: '/images/lipstick.jpeg',
    },
    {
      name: 'Kids Puzzle',
      description: 'Educational and fun',
      category: 'kids corner',
      price: 19,
      image: '/images/puzzle.jpeg',
    },
    {
      name: 'Microwave Oven',
      description: 'Convenient kitchen appliance',
      category: 'home appliance',
      price: 150,
      image: '/images/microwave.jpeg',
    }
  ]);

  console.log('Sample products added');
}

seedProducts();
