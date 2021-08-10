import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumber } from "ethers";
import { deployContract, upgradeImplementation , encodeCall as encoder} from "../scripts/helpers";
const { ethers } = require("hardhat");

chai.use(solidity);

let SubsquidContractFactory: any, subsquidInstance: any;
let owner: any, addr1: any, addr2: any, addr3: any;
const AMOUNT = 10000;
const MAX_CAP = "1000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function subsquidBasicTests(
  beforeHook: any,
  AMOUNT: number,
  MAX_CAP: string,
  ZERO_ADDRESS: string,
  description: string
) {
  describe(description, async function () {
    before(beforeHook);
    describe("Should successfully deploy contract", async function () {
      it("Should successfully create a subsquid token", async function () {
        expect(await subsquidInstance.decimals()).to.equal(18);
        expect(await subsquidInstance.name()).to.equal("Subsquid");
        expect(await subsquidInstance.symbol()).to.equal("SQD");
        expect(await subsquidInstance.balanceOf(owner.address)).to.equal(
          MAX_CAP
        );
        expect(await subsquidInstance.totalSupply()).to.equal(
          MAX_CAP
        );
        expect(await subsquidInstance.owner()).to.equal(owner.address);
      });
    });
    describe("Transfer tests", async function () {
      it("Should successfully be able to transfer token from one account to other", async function () {
        await expect(subsquidInstance.transfer(addr1.address, AMOUNT))
          .to.emit(subsquidInstance, "Transfer")
          .withArgs(owner.address, addr1.address, AMOUNT);
        expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(
          AMOUNT
        );
      });
      it("Should fail transfer token from one account for insufficient balance", async function () {
        expect(await subsquidInstance.balanceOf(addr2.address)).to.equal(0);
        await expect(
          subsquidInstance.connect(addr2).transfer(addr1.address, AMOUNT)
        ).to.be.reverted;
      });
    });

    describe("Token Pause functionality tests", async function () {
      it("Should successfully be able to pause and unpause a contract", async function () {
        await expect(subsquidInstance.pause())
          .to.emit(subsquidInstance, "Paused")
          .withArgs(owner.address);
        await expect(
          subsquidInstance.transfer(addr1.address, AMOUNT)
        ).to.be.revertedWith("Pausable: paused");
        await expect(subsquidInstance.unpause())
          .to.emit(subsquidInstance, "Unpaused")
          .withArgs(owner.address);
        await subsquidInstance.transfer(addr1.address, AMOUNT);
        expect(await subsquidInstance.balanceOf(addr1.address)).to.equal(
          2 * AMOUNT
        );
      });
    });

    describe("UUPS Intializer tests", async function () {
      it("Initialize should be callable only once", async function () {
        await expect(subsquidInstance.initialize()).to.be.revertedWith(
          "Initializable: contract is already initialized"
        );
      });
    });

  describe("token burn functionality tests", async function () {
    it("Should successfully be able burn tokens", async function () {
      const totalSupply = await subsquidInstance.totalSupply();
      await expect(subsquidInstance.burn(AMOUNT))
        .to.emit(subsquidInstance, "Transfer")
        .withArgs(owner.address, ZERO_ADDRESS, AMOUNT);
      const newSupply = await subsquidInstance.totalSupply();
      expect(BigNumber.from(newSupply)).to.equal(totalSupply.sub(AMOUNT));
    });
    it("Should fail burn tokens in case of insufficient balance", async function () {
      await expect(
        subsquidInstance.connect(addr2).burn(AMOUNT)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("Should Successfully burn tokens to which you have allowance to", async function () {
      await subsquidInstance.increaseAllowance(addr2.address, AMOUNT);
      await expect(
        subsquidInstance.connect(addr2).burnFrom(owner.address, AMOUNT)
      ) .to.emit(subsquidInstance, "Transfer")
      .withArgs(owner.address, ZERO_ADDRESS, AMOUNT);
    });

    it("Should fail burning tokens to which you do not have allowance to", async function () {
      await expect(
        subsquidInstance.connect(addr2).burnFrom(owner.address, AMOUNT)
      ) .to.be.revertedWith('ERC20: burn amount exceeds allowance')
    });
  });
    describe("token allowance tests", async function () {
      it("Should successFully add allowance and be able to transfer amounts", async function () {
        await expect(subsquidInstance.increaseAllowance(addr2.address, AMOUNT))
          .to.emit(subsquidInstance, "Approval")
          .withArgs(owner.address, addr2.address, AMOUNT);
        expect(await subsquidInstance.balanceOf(addr2.address)).to.equal(0);
        expect(await subsquidInstance.allowance(owner.address,addr2.address)).to.equal(AMOUNT);
        await expect(
          subsquidInstance
            .connect(addr2)
            .transferFrom(owner.address, addr2.address, AMOUNT)
        )
          .to.emit(subsquidInstance, "Transfer")
          .withArgs(owner.address, addr2.address, AMOUNT);
        expect(await subsquidInstance.balanceOf(addr2.address)).to.equal(
          AMOUNT
        );
        expect(await subsquidInstance.allowance(owner.address,addr2.address)).to.equal(0);
      });

      it("Should successFully decrease allowance", async function () {
        await expect(subsquidInstance.increaseAllowance(addr2.address, AMOUNT))
          .to.emit(subsquidInstance, "Approval")
          .withArgs(owner.address, addr2.address, AMOUNT);
          expect(await subsquidInstance.allowance(owner.address,addr2.address)).to.equal(AMOUNT);
        await expect(subsquidInstance.decreaseAllowance(addr2.address, AMOUNT/2))
          .to.emit(subsquidInstance, "Approval")
          .withArgs(owner.address, addr2.address, AMOUNT/2);
          expect(await subsquidInstance.allowance(owner.address,addr2.address)).to.equal(AMOUNT/2);
      });

      it("Transfer from function should fail upon inadequate allowance", async function () {
        await expect(
          subsquidInstance
            .connect(addr2)
            .transferFrom(owner.address, addr2.address, AMOUNT)
        ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
      });

      it("Should successFully add allowance using approve", async function () {
        expect(await subsquidInstance.allowance(owner.address,addr3.address)).to.equal(0);
        await expect(subsquidInstance.approve(addr3.address, AMOUNT))
          .to.emit(subsquidInstance, "Approval")
          .withArgs(owner.address, addr3.address, AMOUNT);
        expect(await subsquidInstance.allowance(owner.address,addr3.address)).to.equal(AMOUNT);
      });
    });
  });

  describe("Minting tokens test", async function () {
    it("Owner of the contract should be able to mint tokens", async function () {
      await expect(subsquidInstance.mint(addr3.address, AMOUNT)).to.emit(subsquidInstance, "Transfer")
      .withArgs(ZERO_ADDRESS, addr3.address, AMOUNT);
      expect(await subsquidInstance.balanceOf(addr3.address)).to.equal(
        AMOUNT
      );
    });
    it("Only Owner of the contract should be able to mint tokens", async function () {
      await expect(subsquidInstance.connect(addr3).mint(addr3.address, AMOUNT))
      .to.be.revertedWith('Ownable: caller is not the owner')
    });
   
  });

  describe("Proxy token ownership tests", async function () {
    it("Ownership should be successfully transferred to another address", async function () {
      expect(await subsquidInstance.owner()).to.equal(
        owner.address
      );
      await expect(subsquidInstance.transferOwnership(addr3.address)).to.emit(subsquidInstance, "OwnershipTransferred")
      .withArgs(owner.address, addr3.address);
      expect(await subsquidInstance.owner()).to.equal(
        addr3.address
      );
    });

    it("Admin should be able to successfully renounce ownership", async function () {
      expect(await subsquidInstance.owner()).to.equal(
        addr3.address
      );
      await expect(subsquidInstance.connect(addr3).renounceOwnership()).to.emit(subsquidInstance, "OwnershipTransferred")
      .withArgs(addr3.address, ZERO_ADDRESS);
      expect(await subsquidInstance.owner()).to.equal(
        ZERO_ADDRESS
      );
    });
   
  });
}
const beforeHookBeforeUpgrade = async () => {
  [owner, addr1, addr2, addr3] = await ethers.getSigners();
  SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
  subsquidInstance = await deployContract('Subsquid')
};

const beforeHookAfterUpgrade = async () => {
  [owner, addr1, addr2, addr3] = await ethers.getSigners();
  SubsquidContractFactory = await ethers.getContractFactory("Subsquid");
  let oldSubsquidInstance =  await deployContract('Subsquid')
  subsquidInstance = await upgradeImplementation( "SubsquidV1",oldSubsquidInstance.address )
};

// Tests for basic erc20
subsquidBasicTests(
  beforeHookBeforeUpgrade,
  AMOUNT,
  MAX_CAP,
  ZERO_ADDRESS,
  `Subsquid ERC20 Token Basic Tests`
);

// Tests for check UUPS Upgrades
subsquidBasicTests(
  beforeHookAfterUpgrade,
  AMOUNT,
  MAX_CAP,
  ZERO_ADDRESS,
  `Upgraded Subsquid ERC20 Token Basic Tests`
);


describe("Upgraded Subsquid Contract Test", async function () {
  before(beforeHookAfterUpgrade);
  it("Version function should be present", async function () {
   expect( await subsquidInstance.getVersion()).to.be.equal("v1.0.0")
  });
});

describe("Testing upgradeability Constraints", async function () {
  let newImplementation:any, SubsquidContractFactoryV1: any;
  const callData = encoder(
    "burn",
    ['uint256'],
    [AMOUNT]
  );
  before(beforeHookBeforeUpgrade);
  beforeEach(async() =>{
     SubsquidContractFactoryV1 = await ethers.getContractFactory(
      "SubsquidV1"
    );
    newImplementation = await SubsquidContractFactoryV1.deploy()
  })

  it("UpgradeTo and upgradeToAndCall function should only be callable via the owner address", async function () {
    await expect(subsquidInstance.connect(addr3).upgradeTo(newImplementation.address)).to.be.revertedWith("Ownable: caller is not the owner")
    await expect(subsquidInstance.connect(addr3).upgradeToAndCall(newImplementation.address, callData)).to.be.revertedWith("Ownable: caller is not the owner")
  });

  it("UpgradeTo call by admin should upgrade the contract to a new implementation", async function () {
    await expect(subsquidInstance.upgradeTo(newImplementation.address)).to.emit(subsquidInstance, "Upgraded")
    .withArgs(newImplementation.address);
    const newProxy = await SubsquidContractFactoryV1.attach(subsquidInstance.address)
    expect( await newProxy.getVersion()).to.be.equal("v1.0.0")
  });

  it("UpgradeToAndCall  by admin should upgrade the contract to a new implementation and execute the task as passed", async function () {
    const oldSupply = await subsquidInstance.totalSupply()
    expect(oldSupply).to.equal(
      MAX_CAP
    );
    await expect(subsquidInstance.upgradeToAndCall(newImplementation.address, callData)).to.emit(subsquidInstance, "Upgraded")
    .withArgs(newImplementation.address);
    const newProxy = await SubsquidContractFactoryV1.attach(subsquidInstance.address)
    const newSupply = await newProxy.totalSupply()
    expect((BigNumber.from(newSupply))).to.equal(oldSupply.sub(AMOUNT))
  });
});

