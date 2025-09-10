const { ethers } = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");

// helper to compute SHA-256 hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return "0x" + hash;
}

async function main() {
  // Get file path from command line argument
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Please provide a file path. Example:");
    console.error("   npx hardhat run scripts/verifyDocument.js --network localhost docs/degree.pdf");
    process.exit(1);
  }

  const fileRegistryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // replace once
  const FileRegistry = await ethers.getContractFactory("FileRegistry");
  const fileRegistry = FileRegistry.attach(fileRegistryAddress);

  const docHash = getFileHash(filePath);
  console.log(`Verifying document: ${filePath}`);
  console.log(`Hash: ${docHash}`);

  try {
    const doc = await fileRegistry.documents(docHash);

    if (doc.institution === ethers.constants.AddressZero) {
      console.log("❌ Document not found");
    } else if (doc.isRevoked) {
      console.log("❌ Document revoked");
    } else {
      console.log("✅ Document is valid");
      console.log(`   Issuer: ${doc.institution}`);
      console.log(`   Type: ${doc.docType}`);
      console.log(`   Timestamp: ${doc.timestamp}`);
    }
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
