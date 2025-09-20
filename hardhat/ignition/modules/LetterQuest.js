const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LetterQuestModule", (m) => {
  const letterQuest = m.contract("LetterQuest", []);

  const addTargetWordsCall = m.call(
    letterQuest,
    "addTargetWords",
    ["WORD", "HOUSE", "TIME"]
  );

  return {
    letterQuest,
    addTargetWordsCall
  };
});