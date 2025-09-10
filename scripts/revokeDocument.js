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
  if (!filePath) {
    console.error("❌ Usage: npx hardhat run scripts/revokeDocument.js --network localhost <filePath>");
    process.exit(1);
  }

  const fileRegistryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const FileRegistry = await ethers.getContractFactory("FileRegistry");
  const fileRegistry = FileRegistry.attach(fileRegistryAddress);

  const docHash = getFileHash(filePath);

  console.log(`Revoking document: ${filePath}`);
  console.log(`Hash: ${docHash}`);

  const tx = await fileRegistry.revokeDocument(docHash);
  await tx.wait();

  console.log("✅ Document revoked successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

