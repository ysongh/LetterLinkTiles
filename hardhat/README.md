# Hardhat
 
 ```shell
 npx hardhat help
 npx hardhat test
 REPORT_GAS=true npx hardhat test
 npx hardhat node
 ```

## Deploy to localhost
npx hardhat ignition deploy ./ignition/modules/OnChainScrabble.js --network localhost

## Deploy to Flow EVM Testnet
npx hardhat ignition deploy ./ignition/modules/OnChainScrabble.js --network flowEVMTestnet