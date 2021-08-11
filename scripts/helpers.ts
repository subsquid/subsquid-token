
import abi from 'ethereumjs-abi';
import {BigNumber as BN} from 'ethers';
const { ethers, upgrades } = require("hardhat");


export async function deployWithProxyContract(contractName: string){
    console.log("Starting to deploy to contract")
    const Subsquid = await ethers.getContractFactory(contractName);
    const subsquid = await upgrades.deployProxy(Subsquid, [],  { kind: 'uups' });
    await subsquid.deployed();
    console.log("Deployment Completed")
    return subsquid;
  }

export async function deployContract(contractName: string){
  const SubsquidContractFactoryV1 = await ethers.getContractFactory(
    contractName
  );
  const newImplementation = await SubsquidContractFactoryV1.deploy()
  console.log('New implementation Address', newImplementation.address)
  return newImplementation;
}

export async function upgradeImplementation(contractName:string, proxyAddress: string){
    const Subsquid = await ethers.getContractFactory(contractName);
    const subsquid = await upgrades.upgradeProxy(proxyAddress,Subsquid);
    await subsquid.deployed();
    return subsquid;
  }

export async function etherscanVerify(hre : any, contactAddress: string){
    await hre.run("verify:verify", {
      address: contactAddress,
      constructorArguments: [],
    });
  }

  

  /**
 * Helper to encode delegate call parameters
 */
function formatValue(value:any) {
  if (typeof (value) === 'number' || BN.isBigNumber(value)) {
    return value.toString();
  } else if (typeof (value) === 'string' && value.match(/\d+(\.\d+)?e(\+)?\d+/)) {
    return BN.from(value).toString();
  }
  return value;
}

export function encodeCall(name:string, args:any = [], rawValues:any = []) {
  const values = rawValues.map(formatValue);
  const methodId = abi.methodID(name, args).toString('hex');
  const params = abi.rawEncode(args, values).toString('hex');
  return `0x${methodId}${params}`;
}