import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "ramadan.db");
console.log(`Initializing database at: ${dbPath}`);

let db: Database.Database;
try {
  db = new Database(dbPath);
  console.log("Database connection established");
} catch (err) {
  console.error("CRITICAL: Failed to open database:", err);
  // Fallback to in-memory if file fails (though data won't persist)
  db = new Database(":memory:");
  console.log("Using in-memory database as fallback");
}

// Initialize database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prize_counts (
      prize_name TEXT PRIMARY KEY,
      current_count INTEGER DEFAULT 0,
      max_limit INTEGER
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      programs TEXT,
      discount_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contest_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      image_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO prize_counts (prize_name, current_count, max_limit) VALUES ('capcut', 0, 6);
    INSERT OR IGNORE INTO prize_counts (prize_name, current_count, max_limit) VALUES ('office', 0, 10);
  `);
  console.log("Database initialized successfully");
} catch (err) {
  console.error("Database initialization error:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/prize-status", (req, res) => {
    try {
      const counts = db.prepare("SELECT * FROM prize_counts").all();
      res.json(counts);
    } catch (err) {
      console.error("Error fetching prize status:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/all-data", (req, res) => {
    try {
      const { password } = req.query;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const prizes = db.prepare("SELECT * FROM prize_counts").all();
      const offers = db.prepare("SELECT * FROM offers ORDER BY created_at DESC").all();
      const contest = db.prepare("SELECT * FROM contest_entries ORDER BY created_at DESC").all();
      
      res.json({ prizes, offers, contest });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/submit-offer", (req, res) => {
    const { phone, programs, discountCode } = req.body;
    db.prepare("INSERT INTO offers (phone, programs, discount_code) VALUES (?, ?, ?)").run(phone, programs.join(', '), discountCode || '');
    res.json({ success: true });
  });

  app.post("/api/submit-contest", (req, res) => {
    const { phone, image } = req.body;
    db.prepare("INSERT INTO contest_entries (phone, image_data) VALUES (?, ?)").run(phone, image);
    res.json({ success: true });
  });

  app.post("/api/admin/update-limit", (req, res) => {
    try {
      const { password, prizeName, newLimit } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      db.prepare("UPDATE prize_counts SET max_limit = ? WHERE prize_name = ?").run(newLimit, prizeName);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating limit:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/update-current-count", (req, res) => {
    try {
      const { password, prizeName, newCount } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      db.prepare("UPDATE prize_counts SET current_count = ? WHERE prize_name = ?").run(newCount, prizeName);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating current count:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/add-prize", (req, res) => {
    try {
      const { password, prizeName, limit } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      db.prepare("INSERT INTO prize_counts (prize_name, current_count, max_limit) VALUES (?, 0, ?)").run(prizeName, limit);
      res.json({ success: true });
    } catch (e) {
      console.error("Error adding prize:", e);
      res.status(400).json({ error: "Prize already exists or invalid data" });
    }
  });

  app.post("/api/admin/delete-prize", (req, res) => {
    try {
      const { password, prizeName } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      db.prepare("DELETE FROM prize_counts WHERE prize_name = ?").run(prizeName);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting prize:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/delete-offer", (req, res) => {
    try {
      const { password, id } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      db.prepare("DELETE FROM offers WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting offer:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/delete-contest", (req, res) => {
    try {
      const { password, id } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      db.prepare("DELETE FROM contest_entries WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting contest entry:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/reset-count", (req, res) => {
    try {
      const { password, prizeName } = req.body;
      if (password !== "a52s") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      db.prepare("UPDATE prize_counts SET current_count = 0 WHERE prize_name = ?").run(prizeName);
      res.json({ success: true });
    } catch (err) {
      console.error("Error resetting count:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/claim-prize", (req, res) => {
    // Get all prizes that still have availability
    const availablePrizes = db.prepare("SELECT * FROM prize_counts WHERE current_count < max_limit").all() as any[];
    
    if (availablePrizes.length > 0) {
      // Pick a random prize from available ones
      const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
      
      db.prepare("UPDATE prize_counts SET current_count = current_count + 1 WHERE prize_name = ?").run(selectedPrize.prize_name);
      return res.json({ success: true, prize: selectedPrize.prize_name });
    }

    // Fallback to discount code if no prizes are available
    const discounts = [5, 10, 15];
    const randomDiscount = discounts[Math.floor(Math.random() * discounts.length)];
    res.json({ success: true, prize: `discount_${randomDiscount}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
