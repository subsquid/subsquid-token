// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
export {}; // Fix for redeclaration of block scoped variable
const hre = require("hardhat");
const fs = require('fs')
const path = require('path')
import { etherscanVerify, upgradeImplementation } from "./helpers";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  console.log("Starting to deploy to contract")
  
  const fileName = process.env.FILE_NAME || (hre.network.name + '.json') ;
  let deploymentMetadata = JSON.parse( fs.readFileSync(path.join(__dirname,`../.openzeppelin/${fileName}`), 'utf8'))
  const proxyAddress = deploymentMetadata.proxies[0].address;
  const subsquid = await upgradeImplementation("SubsquidV1",proxyAddress)
  deploymentMetadata = JSON.parse( fs.readFileSync(path.join(__dirname,`../.openzeppelin/${fileName}`), 'utf8'))
  console.log("Deployment Completed")
  if(hre.network.name !== "localhost"){
    const currentImplementationPos = Object.keys(deploymentMetadata.impls).length - 1
    const implementationAddress = deploymentMetadata.impls[Object.keys(deploymentMetadata.impls)[currentImplementationPos]].address
    console.log("Starting etherscan verification")
    await etherscanVerify(hre, implementationAddress)
  }
  console.log("Subsquid deployed to:", subsquid.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
