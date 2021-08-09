import chai, {expect} from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let SubsquidContractFactory:any , subsquidInstance:any;
let owner:any, addr1:any;
const amount = 10000;
const maxCap = "1000000000000000000000000000";

describe("Subsquid ERC20 Token", async function () {
  before(async () => {
    [owner,addr1] = await ethers.getSigners();
    SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
    subsquidInstance =  await upgrades.deployProxy(SubsquidContractFactory, [],  { kind: 'uups' });
    await subsquidInstance.deployed();
    console.log("Subsquid deployed to:", subsquidInstance.address);
  });
  it("Should successfully create a subsquid token", async function () {
    expect(await subsquidInstance.decimals()).to.equal(18);
    expect(await subsquidInstance.symbol()).to.equal("SQD");
    expect(await subsquidInstance.balanceOf(owner.address)).to.equal(maxCap);
    expect(await subsquidInstance.owner()).to.equal(owner.address);
  });

  it("Should successfully be able to transfer token from one account to other",async function(){
     await expect(subsquidInstance.transfer(addr1.address, amount)).to.emit(subsquidInstance, 'Transfer')
     .withArgs(owner.address,addr1.address, amount);
    expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(amount);
  })

  it("Should successfully be able to pause and unpause a contract",async function(){
    await expect(subsquidInstance.pause()).to.emit(subsquidInstance, 'Paused') .withArgs(owner.address);
    await expect( subsquidInstance.transfer(addr1.address, amount)).to.be.revertedWith('Pausable: paused')
    await expect(subsquidInstance.unpause()).to.emit(subsquidInstance, 'Unpaused') .withArgs(owner.address);
    await subsquidInstance.transfer(addr1.address, amount)
    expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(2* amount);
  })
});
