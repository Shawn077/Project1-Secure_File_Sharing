async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with account:", deployer.address);
  
    const FileRegistry = await ethers.getContractFactory("FileRegistry");
    const fileRegistry = await FileRegistry.deploy();
  
    console.log("FileRegistry deployed to:", fileRegistry.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  