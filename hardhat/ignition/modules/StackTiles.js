const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StackTilesModule", (m) => {
  const stackTiles = m.contract("StackTiles", []);

  return {
    stackTiles
  };
});