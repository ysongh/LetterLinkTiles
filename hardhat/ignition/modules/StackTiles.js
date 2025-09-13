const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StackTilesModule", (m) => {
  const stackTiles = m.contract("StackTiles", []);

  const addTargetWordsCall = m.call(
    stackTiles,
    "addTargetWords",
    ["WORD", "HOUSE", "TIME"]
  );

  return {
    stackTiles,
    addTargetWordsCall
  };
});