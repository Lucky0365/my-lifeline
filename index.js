const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve static files from 'public'
app.use(express.static("public"));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.status(200).send("File uploaded");
});

// Return list of uploaded files
app.get("/images", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).send("Error reading uploads folder");
    res.json(files);
  });
});

// Delete image endpoint
app.delete("/delete", (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send("No image name provided");

  const filePath = path.join(__dirname, "uploads", name);

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send("File not found or couldn't delete");
    res.send("Deleted");
  });
});

// ✅ Add homepage route for Render's root request
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
