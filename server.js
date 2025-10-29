import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// === 1️⃣ Validate the environment variable early ===
if (!process.env.GOOGLE_SCRIPT_URL) {
  console.error("❌ ERROR: GOOGLE_SCRIPT_URL not found in .env");
  process.exit(1);
}
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL.trim();

// === 2️⃣ Serve static files ===
// Serve all files in Main (acts as your web root)
app.use(express.static(path.join(__dirname, "Main")));

// === 3️⃣ Routes ===
// Proxy API for Google Apps Script
app.post("/submit", async (req, res) => {
  try {
    console.log("Received submission:", JSON.stringify(req.body, null, 2));
    
    if (!req.body.name || !req.body.phone || !req.body.routine) {
      return res.status(400).json({ 
        ok: false, 
        error: "Missing required fields" 
      });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Google Script responded with status: ${response.status}`);
    }

    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = { ok: true, text: await response.text() };
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      details: "Server failed to process the request"
    });
  }
});

// Serve specific pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Main", "Home", "index.html"));
});

app.get("/routine", (req, res) => {
  res.sendFile(path.join(__dirname, "Main", "Routine", "routine.html"));
});

// === 4️⃣ Port setup ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at: http://localhost:${PORT}`)
);
