const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenTilesModule", (m) => {
  const targetWords = m.contract("TargetWords", []);

  return {
    targetWords
  };
});