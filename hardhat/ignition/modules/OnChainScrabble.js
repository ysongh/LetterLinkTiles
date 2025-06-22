const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenTilesModule", (m) => {
  const onChainScrabble = m.contract("OnChainScrabble", ["0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"]);

  return {
    onChainScrabble
  };
});