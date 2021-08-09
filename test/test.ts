import chai, {expect} from "chai";
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { BigNumber } from "ethers";

chai.use(solidity);

let SubsquidContractFactory:any , subsquidInstance:any;
let owner:any, addr1:any, addr2:any, addr3:any;
const AMOUNT = 10000;
const MAX_CAP = "1000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Subsquid ERC20 Token Basic Tests", async function () {
  before(async () => {
    [owner,addr1,addr2] = await ethers.getSigners();
    SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
    subsquidInstance =  await upgrades.deployProxy(SubsquidContractFactory, [],  { kind: 'uups' });
    await subsquidInstance.deployed();
  });
  it("Should successfully create a subsquid token", async function () {
    expect(await subsquidInstance.decimals()).to.equal(18);
    expect(await subsquidInstance.name()).to.equal("Subsquid");
    expect(await subsquidInstance.symbol()).to.equal("SQD");
    expect(await subsquidInstance.balanceOf(owner.address)).to.equal(MAX_CAP);        
    expect(await subsquidInstance.owner()).to.equal(owner.address);
  });

  it("Should successfully be able to transfer token from one account to other",async function(){
     await expect(subsquidInstance.transfer(addr1.address, AMOUNT)).to.emit(subsquidInstance, 'Transfer')
     .withArgs(owner.address,addr1.address, AMOUNT);
    expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(AMOUNT);
  })

  it("Should successfully be able to pause and unpause a contract",async function(){
    await expect(subsquidInstance.pause()).to.emit(subsquidInstance, 'Paused') .withArgs(owner.address);
    await expect( subsquidInstance.transfer(addr1.address, AMOUNT)).to.be.revertedWith('Pausable: paused')
    await expect(subsquidInstance.unpause()).to.emit(subsquidInstance, 'Unpaused') .withArgs(owner.address);
    await subsquidInstance.transfer(addr1.address, AMOUNT)
    expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(2* AMOUNT);
  })

  it("Initialize should be callable once",async function(){
    await expect(subsquidInstance.initialize()).to.be.revertedWith('Initializable: contract is already initialized')
  })

  it("Should successfully be able burn tokens",async function(){
    const totalSupply = await subsquidInstance.totalSupply()
    await expect(subsquidInstance.burn(AMOUNT)).to.emit(subsquidInstance, 'Transfer') .withArgs(owner.address, ZERO_ADDRESS, AMOUNT);
    const newSupply = await subsquidInstance.totalSupply()
    expect(BigNumber.from(newSupply)).to.equal(totalSupply.sub(AMOUNT));
  })

  it("should successFully add allowance and be able to transfer amounts",async function(){
     await expect(subsquidInstance.increaseAllowance(addr2.address,AMOUNT)).to.emit(subsquidInstance, 'Approval') 
    .withArgs(owner.address, addr2.address, AMOUNT);
    expect(await subsquidInstance.balanceOf(addr2.address)).to.equal(0);
    await expect(subsquidInstance.connect(addr2).transferFrom(owner.address, addr2.address, AMOUNT)).to.emit(subsquidInstance, 'Transfer')
     .withArgs(owner.address,  addr2.address, AMOUNT);
     expect(await subsquidInstance.balanceOf(addr2.address)).to.equal(AMOUNT);
  })
});
