const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    default: "General",
  },

  description: {
    type: String,
  },

  longDescription: {
    type: String,
  },

  features: {
    type: [String],
    default: [],
  },

  videoUrl: {
    type: String,
  },

  videoFile: {
    type: String,
  },

  images: {
    type: [String],
    default: [],
  },

  websiteUrl: {
    type: String,
  },

  pricingType: {
    type: String,
    enum: ["Free", "Paid", "Freemium", "Subscription", "One-Time"],
    default: "Free",
  },

  ownerName: {
    type: String,
    required: true,
  },

  ownerImage: {
    type: String,
  },

  ownerEmail: {
    type: String,
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  },

  votes: {
    type: Number,
    default: 0,
  },

  votedUsers: {
    type: [String], // userEmail list
    default: [],
  },

  comments: {
    type: [Object],
    default: []
  },



  timestamp: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  reports: {
    type: [String], // userEmail list of reporters
    default: [],
  }
});



const Product = mongoose.model("Product", productSchema);

module.exports = Product;
