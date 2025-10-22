const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LetterQuestModule", (m) => {
  const token20 = m.contract("TileTokenERC20", []);
  const letterQuest = m.contract("LetterQuest", [token20]);

  const addTargetWordsCall = m.call(
    letterQuest,
    "addTargetWords",
    ["WORD", "HOUSE", "TIME"]
  );

  return {
    token20,
    letterQuest,
    addTargetWordsCall
  };
});