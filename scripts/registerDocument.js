const crypto = require("crypto");
const fs = require("fs");

// helper function to compute SHA-256 hash of a file
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return "0x" + hash; // prepend 0x for Solidity bytes32
}


const { ethers } = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return "0x" + hash;
}

async function main() {
  const filePath = process.argv[2];
  const docType = process.argv[3] || "Generic";

  if (!filePath) {
    console.error("❌ Usage: npx hardhat run scripts/registerDocument.js --network localhost <filePath> [docType]");
    process.exit(1);
  }

  const fileRegistryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const FileRegistry = await ethers.getContractFactory("FileRegistry");
  const fileRegistry = FileRegistry.attach(fileRegistryAddress);

  const docHash = getFileHash(filePath);

  console.log(`Registering ${docType} for file: ${filePath}`);
  console.log(`Hash: ${docHash}`);

  const tx = await fileRegistry.registerDocument(docHash, docType);
  await tx.wait();

  console.log("✅ Document registered successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

