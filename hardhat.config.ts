require('@openzeppelin/hardhat-upgrades');
require('dotenv').config()
import "solidity-coverage"
import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import 'hardhat-abi-exporter';


const config: HardhatUserConfig ={
  solidity: 
  {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.ETH_KEY || ""],
      timeout: 100000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.ETH_KEY || ""],
      timeout: 100000
    }
  },
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
      currency: 'USD',
      noColors: false,
      gasPrice: 44,
      coinmarketcap: process.env.COIN_MARKETCAP_KEY,
      // outputFile :"gasreport.txt"
    },
    abiExporter: {
      path: './abi',
      clear: true,
      flat: true,
      only: [':Subsquid$'],
      spacing: 2
    }
};


export default config;