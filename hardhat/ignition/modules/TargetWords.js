const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenTilesModule", (m) => {
  const targetWords = m.contract("TargetWords", []);

  const addTargetWordsCall = m.call(
    targetWords,
    "addTargetWords",
    ["WORD", "HOUSE", "TIME"]
  );

  return {
    targetWords,
    addTargetWordsCall
  };
});