const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const fileBase64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${fileBase64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "apporbit_uploads",
    });

    res.send({ imageUrl: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    res.status(500).send({ message: "Upload failed", error: err });
  }
});

module.exports = router;
