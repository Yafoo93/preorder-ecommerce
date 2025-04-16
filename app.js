require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');


const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(expressLayouts); // Use layouts
app.set('layout', 'layouts/main');

// Session setup
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  

// Routes
app.use('/', require('./routes/index')); //home page
app.use('/', require('./routes/users')); //user
app.use('/', require('./routes/admin')); //admin


app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });  


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const Product = require('./models/product');

async function seedProducts() {
  // Clear existing products
  await Product.deleteMany({});
  
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
      category: 'furniture',
      price: 499,
      image: '/images/sofa1.jpeg',
    },
    {
      name: 'iPhone Apple',
      description: 'Latest Apple device preorder',
      category: 'electronics',
      price: 999,
      image: '/images/apple.jpeg',
    },
    {
      name: 'Luxury Sofa',
      description: 'Comfortable and stylish seating',
      category: 'furniture',
      price: 799,
      image: '/images/sofa2.jpeg',
    },
  ]);
  console.log('Sample products added');
}

seedProducts();
