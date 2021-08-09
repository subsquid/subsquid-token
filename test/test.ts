const { expect, use } = require("chai");
import { ethers } from "hardhat";

let SubsquidContractFactory:any , subsquidInstance:any;
let owner:any, addr1:any;

describe("Subsquid ERC20 Token", async function () {
  before(async () => {
    [owner,addr1] = await ethers.getSigners();
    SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
    subsquidInstance =  await upgrades.deployProxy(SubsquidContractFactory, [],  { kind: 'uups' });
    await subsquidInstance.deployed();
  });
  it("Should successfully create a subsquid token", async function () {

    console.log("Box deployed to:", subsquidInstance.address);
    expect(await subsquidInstance.decimals()).to.equal(18);
    expect(await subsquidInstance.symbol()).to.equal("SQD");
    expect(await subsquidInstance.balanceOf(owner.address)).to.equal("1000000000000000000000000000");
  });

  it("Should successfully be able to transfer token from one account to other",async function(){
    const amount = 10000;
    const transferToken = await subsquidInstance.transfer(addr1.address, amount)
    await transferToken.wait();
    expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(amount);
  })
});
