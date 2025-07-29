const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // ✅ ঠিক path

router.get("/stats", async (req, res) => {
  try {
    const [total, accepted, pending, rejected] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "Accepted" }),
      Product.countDocuments({ status: "Pending" }),
      Product.countDocuments({ status: "Rejected" }),
    ]);

    res.send({
      totalProducts: total,
      accepted,
      pending,
      rejected,
      totalReviews: 0,
      totalUsers: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
});

module.exports = router;
