const { expect, use } = require("chai");
import { ethers } from "hardhat";

let SubsquidContractFactory:any , subsquidInstance:any;
let owner:any;

describe("Subsquid ERC20 Token", async function () {
  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
    subsquidInstance =  await upgrades.deployProxy(SubsquidContractFactory, [],  { kind: 'uups' });
    await subsquidInstance.deployed();
  });
  it("Should return the new subsquid token once it's changed", async function () {

    console.log("Box deployed to:", subsquidInstance.address);
    expect(await subsquidInstance.decimals()).to.equal(18);
    expect(await subsquidInstance.symbol()).to.equal("SQD");
    expect(await subsquidInstance.balanceOf(owner.address)).to.equal("1000000000000000000000000000");

    // const setGreetingTx = await subsquid.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await subsquid.greet()).to.equal("Hola, mundo!");
  });
});
