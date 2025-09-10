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
  const oldFilePath = process.argv[2];
  const newFilePath = process.argv[3];
  const docType = process.argv[4] || "Generic";

  if (!oldFilePath || !newFilePath) {
    console.error("❌ Usage: npx hardhat run scripts/reissueDocument.js --network localhost <oldFilePath> <newFilePath> [docType]");
    process.exit(1);
  }

  const fileRegistryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const FileRegistry = await ethers.getContractFactory("FileRegistry");
  const fileRegistry = FileRegistry.attach(fileRegistryAddress);

  const oldHash = getFileHash(oldFilePath);
  const newHash = getFileHash(newFilePath);

  console.log(`Reissuing document:\n  Old: ${oldFilePath} (hash ${oldHash})\n  New: ${newFilePath} (hash ${newHash})`);

  const tx = await fileRegistry.reissueDocument(newHash, docType, oldHash);
  await tx.wait();

  console.log("✅ Document reissued successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

