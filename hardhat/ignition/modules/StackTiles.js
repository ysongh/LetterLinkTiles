const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StackTilesModule", (m) => {
  const stackTiles = m.contract("StackTiles", []);

  const addTargetLettersCall = m.call(
    stackTiles,
    "addTargetLetters",
    ["W", "T", "A"]
  );

  return {
    stackTiles,
    addTargetLettersCall
  };
});