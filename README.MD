# Subsquid Framework Token

Official Implementation for Subsquid ERC20 Upgradable Token.

![Version Badge](https://img.shields.io/badge/version-1.0.0-lightgrey.svg)

## Prerequisites
 - NodeJs@14 +

## Environment Variables Needed

Create a .env file at the root of the project and populate the different keys. It will be automatically loaded into the application at run time.
```sh
ETHERSCAN_API_KEY="<Paste-Your-Key-here>"
ETH_KEY="<Paste-Your-Private-Key-here>"
INFURA_KEY="<Paste-Your-Key-here>"
COIN_MARKETCAP_KEY="<Paste-Your-Key-here>"
GNOSIS_CONTRACT_ADDRESS="<Paste-Your-Address>" # For testnets only rinkeby is supported
HARDHAT_VERBOSE=true
```
- Etherscan Key is required for contract source code verification. We use hardhat etherscan plugin to automatically verify the contract during deployment. You can get it [here](https://etherscan.io/apidocs).
- ETH_KEY is the private ethereum key with which the contract is going to be deployed with to the mainnet / testnets. It should have sufficient funds for spending the contract deployment costs.
- INFURA_KEY can be obtained [here](https://infura.io/). 
- COIN_MARKETCAP_KEY is used to get gas cost estimates while running the tests. It will give an approximate value of gas cost incurred using the gas price (Default 44) in gwei and currency (Default USD) parameters defined in hardhat.config.ts file.
- Deployment can be transferred to a gnosis multisig contract instead of a central address. Create a gnosis contract and 
use deployment steps specific to gnosis to use it.
## How To Run

- Clone the repo
- npm install
- npm run test // to run the tests and also to get gas estimates for important operations
- npm run coverage // to get coverage results

## Contracts

The smart contracts can be seen in contracts folder. ```Subsquid.sol``` is the ERC20 contract and SubsquidV1 in mocks folder is a test contract for testing upgradeability. A flattened version of the contract can also be seen under ```flatten/Subsquid_flatten.sol```. Simply run ```npm run flatten``` to update the flattened contract for any changes.

## Deployment

### Local
 Open a separate terminal and run ```npm run local:node``` which will start a local node listening to port 8545. In another terminal run ```npm run deploy:local```.
 You can also run ```npm run deploy-upgrade:local``` to upgrade the implementation to another version

 ### Testnets
 Make sure the private key has sufficient funds

```
- npm run deploy:ropsten // for ropsten
- npm run deploy:rinkeby // for rinkeby
- npm run deploy:kovan // for kovan
```

For Gnosis, Only rinkeby is supported
```
- npm run deploy:gnosis // for rinkeby
```
 To test upgradeability simply run

 ```npm run deploy-upgrade:<network-name> ```

 For Gnosis
 ``` npm run deploy-upgrade:gnosis```

 You will get a new implementation address which you will have to use to create a upgrade proposal in for example openzeppelin defender admin to which it will successfully upgrade after stakeholder approval reaches minimum threshold.

 ### Mainnet
 Make sure the private key has sufficient funds. Make sure to comment out the .openzeppelin and artifacts from gitignore as it is needed to be committed which will help for later upgrades if needed.

```
- npm run deploy:mainnet
```
For Gnosis

 ``` npm run deploy-upgrade:gnosis-mainnet```

 You will get a new implementation address which you will have to use to create a upgrade proposal in for example openzeppelin defender admin to which it will successfully upgrade after stakeholder approval reaches minimum threshold.

### Notes

- If in case etherscan verification fails, Kindly note the deployed contract address and try to reverify using ```npx hardhat verify --network <network-name> "<contract-address>```