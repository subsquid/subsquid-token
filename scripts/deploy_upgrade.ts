// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

export {}; // Fix for  block scoped variable
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const fs = require('fs')
const path = require('path')

import { deployContract, etherscanVerify} from './helpers';

async function upgradeWithGnosis() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const contract = 'SubsquidV1';
  const newImplementation = await deployContract(contract);
  if(hre.network.name !== "localhost"){
  await etherscanVerify(hre,newImplementation.address)
  }
  console.log(`${contract} deployed to:`, newImplementation.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
upgradeWithGnosis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
