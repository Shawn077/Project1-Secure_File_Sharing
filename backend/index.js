require('dotenv').config({ path: 'D:\\Project 1\\secure_file_sharing\\backend\\backend.env' });


console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("INFURA_URL:", process.env.INFURA_URL);
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);


const express = require("express");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const hre = require("hardhat");
const ethers = hre.ethers;

const app = express();
const port = 5000;

// ---------------- DEBUG: Check .env ----------------
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
console.log("INFURA_URL:", process.env.INFURA_URL);
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);

if (!process.env.PRIVATE_KEY || !process.env.INFURA_URL || !process.env.CONTRACT_ADDRESS) {
  console.error("❌ Missing required .env variables! Check PRIVATE_KEY, INFURA_URL, CONTRACT_ADDRESS");
  process.exit(1);
}

// ---------------- File Upload Setup ----------------
const upload = multer({ dest: "uploads/" });

// ---------------- Connect to Blockchain ----------------
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

// Ensure private key is 0x-prefixed
const privateKey = process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : "0x" + process.env.PRIVATE_KEY;

let wallet;
try {
  wallet = new ethers.Wallet(privateKey, provider);
} catch (err) {
  console.error("❌ Invalid PRIVATE_KEY:", err.message);
  process.exit(1);
}

// Connect to deployed contract
let contract;
try {
  const FileRegistryArtifact = require("../artifacts/contracts/FileRegistry.sol/FileRegistry.json");
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, FileRegistryArtifact.abi, wallet);
} catch (err) {
  console.error("❌ Failed to load contract:", err.message);
  process.exit(1);
}

// ---------------- Helper: Compute SHA-256 ----------------
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return "0x" + hash;
}

// ----------------------- ROUTES -----------------------

// Register a document
app.post("/register", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const docType = req.body.docType || "Generic";
    const hash = getFileHash(filePath);

    const tx = await contract.registerDocument(hash, docType);
    await tx.wait();

    res.json({ success: true, hash, docType });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify a document
app.post("/verify", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const hash = getFileHash(filePath);

    const doc = await contract.documents(hash);

    if (doc.institution === ethers.constants.AddressZero) {
      res.json({ valid: false, reason: "Not Found" });
    } else if (doc.isRevoked) {
      res.json({ valid: false, reason: "Revoked" });
    } else {
      res.json({
        valid: true,
        issuer: doc.institution,
        docType: doc.docType,
        timestamp: doc.timestamp.toNumber(),
      });
    }
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).json({ valid: false, error: err.message });
  }
});

// Revoke a document
app.post("/revoke", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const hash = getFileHash(filePath);

    const tx = await contract.revokeDocument(hash);
    await tx.wait();

    res.json({ success: true, hash });
  } catch (err) {
    console.error("Revoke Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------- START SERVER -----------------------
app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
