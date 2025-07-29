const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const verifyToken = require("../middlewares/verifyToken");

// ✅ Add Product
router.post("/add-product", verifyToken, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      tags: req.body.tags || [],
      comments: [],
      votes: 0,
      votedUsers: [],
      reports: [],
    };

    const newProduct = new Product(productData);
    const saved = await newProduct.save();

    res.status(201).json({ insertedId: saved._id });
  } catch (err) {
    console.error("🔥 Add Product Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get Featured Products (Accepted & Featured=true)
router.get("/featured-products", async (req, res) => {
  try {
    const featured = await Product.find({ status: "Accepted", isFeatured: true })
      .sort({ timestamp: -1 })
      .limit(6);
    res.send(featured);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch featured products", error: err });
  }
});

// ✅ Get All Products (for Moderator review page)
router.get("/moderator-review", verifyToken, async (req, res) => {
  try {
    const allProducts = await Product.find().sort({ timestamp: -1 });
    res.send(allProducts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
});

// ✅ Accept / Reject Product
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Accepted", "Rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Accepted' or 'Rejected'." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: `Product ${status.toLowerCase()} successfully`,
      updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product status", error: err.message });
  }
});

// ✅ Mark Product as Featured
router.patch("/mark-as-featured/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product marked as featured", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to feature product", error: err.message });
  }
});

// ✅ Get Products by User Email
router.get("/user/:email", verifyToken, async (req, res) => {
  try {
    const email = req.params.email;
    const products = await Product.find({ ownerEmail: email });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products by user email" });
  }
});

// ✅ Delete Product
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ✅ Pagination & Search (by tag)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "" } = req.query;

    const query = search
      ? { name: { $regex: search, $options: "i" }, status: "Accepted" }
      : { status: "Accepted" };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch("/upvote/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userEmail = req.decoded.email;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).send({ message: "Product not found" });

    if (product.votedUsers?.includes(userEmail)) {
      return res.status(400).send({ message: "You already voted" });
    }

    // ✅ Vote increment and user push in one atomic operation
    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { votes: 1 },
        $push: { votedUsers: userEmail },
      },
      { new: true }
    );

    res.send({ message: "Upvoted!", votes: updated.votes });
  } catch (err) {
    console.error("🔥 Upvote Error:", err.message);
    res.status(500).send({ error: "Upvote failed" });
  }
});

// ✅ Add Comment (updated)
router.post("/:id/comment", verifyToken, async (req, res) => {
  const productId = req.params.id;
  const { comment } = req.body;

  if (!comment || !comment.text) {
    return res.status(400).json({ message: "Comment cannot be empty." });
  }

  const newComment = {
    userName: comment.userName || "Anonymous",
    userImage: comment.userImage || "",
    text: comment.text,
  };

  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.send({ message: "Comment added", comment: newComment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Add Tag
router.patch("/:id/add-tag", verifyToken, async (req, res) => {
  const productId = req.params.id;
  let { tag } = req.body;

  if (!tag || typeof tag !== "string" || !tag.trim()) {
    return res.status(400).json({ message: "Tag cannot be empty." });
  }

  tag = tag.trim().toLowerCase();

  if (tag.length > 30) {
    return res.status(400).json({ message: "Tag is too long (max 30 characters)." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const exists = product.tags.some((t) => t.toLowerCase() === tag);
    if (!exists) {
      product.tags.push(tag);
      await product.save();
    }

    res.status(200).json({
      message: exists ? "Tag already exists" : "Tag added successfully",
      tags: product.tags,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add tag",
      error: err.message,
    });
  }
});

// ✅ Get Single Product by ID (public route)
router.get("/single/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.send(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// for moderator review
router.get("/reported", verifyToken, async (req, res) => {
  const reported = await Product.find({ reports: { $exists: true, $ne: [] } });
  res.send(reported);
});
router.delete("/:id", verifyToken, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  res.send({ message: "Deleted", deleted });
});



// GET /products/trending
router.get("/trending", async (req, res) => {
  try {
    const products = await Product.find({ status: "Accepted" })
      .sort({ votes: -1 }) // Highest voted first
      .limit(6);

    res.send(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trending products", error: err.message });
  }
});

module.exports = router;
