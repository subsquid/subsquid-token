// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const fs = require('fs')
const path = require('path')
import { etherscanVerify, deployContract } from "./helpers";



async function upgradeMain() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const subsquid = await deployContract("Subsquid")

  if(hre.network.name !== "localhost"){
    const currentNetwork = hre.network.name;
    const deploymentMetadata = JSON.parse( fs.readFileSync(path.join(__dirname,`../.openzeppelin/${currentNetwork}.json`), 'utf8'))
    const implementationAddress = deploymentMetadata.impls[Object.keys(deploymentMetadata.impls)[0]].address
    console.log("Starting etherscan verification")
    await etherscanVerify(hre, implementationAddress)
 
  }
  console.log("Subsquid deployed to:", subsquid.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
upgradeMain()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
