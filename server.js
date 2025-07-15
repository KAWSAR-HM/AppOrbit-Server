// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

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

// Test route
app.get('/', (req, res) => {
  res.send('AppOrbit Backend is running...');
});

// Server Listen
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
