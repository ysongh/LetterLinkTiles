const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenTilesModule", (m) => {
  const onChainScrabble = m.contract("OnChainScrabble", ["0x71bE63f3384f5fb98995898A86B02Fb2426c5788"]);

  return {
    onChainScrabble
  };
});