async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with:", deployer.address);
  
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(Math.floor(Date.now() / 1000) + 60);
  
    console.log("Lock contract deployed to:", lock.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  