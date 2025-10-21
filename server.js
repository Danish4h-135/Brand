import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Setup directory info for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ✅ Serve all static files from "Main"
app.use(express.static(path.join(__dirname, "Main")));

// ✅ Your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxCLJfss_uxIixWYUd8VoRYMO2idPYMwlYGk7nj5HrATXcd1h-t14TKfU-8NrhtaeYP8g/exec";

// ✅ Handle CORS preflight requests
app.options("/submit", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  return res.status(204).send("");
});

// ✅ Proxy route
app.post("/submit", async (req, res) => {
  try {
    console.log("📨 Incoming from browser:", req.body);

    // Forward JSON exactly as-is
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log("📦 Response from Google Apps Script:", text);

    res.set("Access-Control-Allow-Origin", "*");
    res.status(200).send(text);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Serve your main HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Main", "routine.html"));
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Proxy + Frontend running on http://localhost:${PORT}`)
);
