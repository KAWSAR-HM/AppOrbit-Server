const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken'); // ✅ JWT Added

const app = express();
const port = process.env.PORT || 5000;
const verifyToken = require('./middlewares/verifyToken'); // ✅ সঠিক path

const statsRoutes = require("./routes/stats");
app.use("/api", statsRoutes);


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error);
});

// ✅ JWT Token Route
// ✅ Add this near your other routes
app.post('/api/jwt', (req, res) => {
  const user = req.body;

  const token = require('jsonwebtoken').sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });

  res.send({ token });
});

// ✅ JWT Middleware
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).send({ message: "unauthorized" });

//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) return res.status(403).send({ message: "forbidden" });

//     req.decoded = decoded;
//     next();
//   });
// };

// Test route
app.get('/', (req, res) => {
  res.send('AppOrbit Backend is running...');
});

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);
// ✅ এই লাইন থাকা দরকার

const uploadRoute = require("./routes/uploadRoute");
app.use("/api/upload", uploadRoute);

// ✅ Example Protected Route (can be removed if not needed)
app.get("/protected", verifyToken, (req, res) => {
  res.send({ message: "Access granted to protected route!", user: req.decoded });
});

// Server Listen
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});


