// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

export {}; // Fix for  block scoped variable
const hre = require("hardhat");
import {MAX_CAP} from './constants';
const fs = require('fs')
const path = require('path')

import {deployWithProxyContract, deployContract, etherscanVerify} from './helpers';

async function upgradeWithGnosis() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const GNOSIS_SAFE = process.env.GNOSIS_CONTRACT_ADDRESS || '';
  const subsquid = await deployWithProxyContract("Subsquid", GNOSIS_SAFE, MAX_CAP);
  console.log('Transferring Admin Privileges to Gnosis contract')
  await subsquid.transferOwnership(GNOSIS_SAFE);
  console.log('Transferred OwnerShip to Gnosis Wallet')
  if(hre.network.name !== "localhost"){
    const currentNetwork = hre.network.name;
    const deploymentMetadata = JSON.parse( fs.readFileSync(path.join(__dirname,`../.openzeppelin/${currentNetwork}.json`), 'utf8'))
    const implementationAddress = deploymentMetadata.impls[Object.keys(deploymentMetadata.impls)[0]].address
  console.log("Starting etherscan verification")
  await etherscanVerify(hre,implementationAddress)
  }
  console.log("Subsquid deployed to:", subsquid.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
upgradeWithGnosis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
