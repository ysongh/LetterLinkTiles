require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    flowEVMTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 545
    },
  },
  paths: {
    artifacts: '../react/src/artifacts',
    cache: '../react/src/cache',
  }
};
