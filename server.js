import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const DESIGNS_FILE = path.join(__dirname, "saved-designs.json");

// Get all saved designs
app.get("/api/designs", (req, res) => {
  if (!fs.existsSync(DESIGNS_FILE)) return res.json([]);
  const data = fs.readFileSync(DESIGNS_FILE);
  res.json(JSON.parse(data));
});

// Save new design
app.post("/api/save-design", (req, res) => {
  const { stickers } = req.body;
  if (!stickers) return res.status(400).json({ error: "No stickers data" });

  let savedDesigns = [];
  if (fs.existsSync(DESIGNS_FILE)) {
    savedDesigns = JSON.parse(fs.readFileSync(DESIGNS_FILE));
  }

  savedDesigns.push({ id: Date.now(), stickers });
  fs.writeFileSync(DESIGNS_FILE, JSON.stringify(savedDesigns, null, 2));

  res.json({ success: true, message: "Design saved!" });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
