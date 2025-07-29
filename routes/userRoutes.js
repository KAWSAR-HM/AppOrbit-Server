// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // যদি আলাদা মডেল ফাইল থাকে

// POST /users
router.post('/', async (req, res) => {
  const { name, email, photo } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.send({ message: 'User already exists' });

    const newUser = new User({ name, email, photo, role: 'user' });
    await newUser.save();

    res.send({ message: 'User created', newUser });
  } catch (err) {
    res.status(500).send({ error: 'Failed to save user' });
  }
});

// GET /users/role/:email
router.get('/role/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.send({ role: user?.role || 'user' });
});

router.get("/", async (req, res) => {
  const users = await User.find(); // from MongoDB
  res.json(users);
});

router.patch("/role/:email", async (req, res) => {
  const email = req.params.email;
  const { role } = req.body;

  const result = await User.updateOne(
    { email },
    { $set: { role } }
  );

  res.json({ modifiedCount: result.modifiedCount });
});

router.get('/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ role: user.role }); // response: { role: 'user' }
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch user' });
  }
});



module.exports = router;
