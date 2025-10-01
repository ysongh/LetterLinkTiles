// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LetterQuest {
  event PlayerJoined(address indexed player);
  event TileMinted(address indexed player, uint8 tile);
  event TileDiscard(address indexed player, uint8[] tile);
  event RollResult(address player, uint8 num);
  event WordSubmitted(address indexed player, string word);

  uint8[27] public tileScores = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  struct Player {
    bool isActive;
    uint8[] tiles;
    uint256 score;
    uint256 tilesUsed;
    uint8 posititon;
  }

  mapping(address => Player) public players;
  address[] public activePlayers;
  address public owner;
  string public targetWord1;
  string public targetWord2;
  string public targetWord3;
  address public winner1;
  address public winner2;
  address public winner3;
  uint256 public tileCost = 0.001 ether;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function joinGame() external {
    require(!players[msg.sender].isActive, "Player already active");
    
    players[msg.sender].isActive = true;
    players[msg.sender].score = 0;
    players[msg.sender].tilesUsed = 0;
    players[msg.sender].posititon = 0;
    
    activePlayers.push(msg.sender);
    emit PlayerJoined(msg.sender);
  }

  function rollDice() public {
    uint8 randomNumber = uint8(getRandomNumber());
    players[msg.sender].posititon += randomNumber + 1;

    if (players[msg.sender].posititon > 26) {
      players[msg.sender].posititon =  players[msg.sender].posititon - 27;
    }

    emit RollResult(msg.sender, randomNumber);
  }

  function submitWord(uint8[] calldata tilesUsed, string memory newTargetWord) external {
    require(bytes(newTargetWord).length == 5, "Target word must be exactly 5 letters");
    
    if (_compareTilesToWord(tilesUsed, targetWord1)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);

      targetWord1 = newTargetWord;
      winner1 = msg.sender;

      emit WordSubmitted(msg.sender, targetWord1);
    } else if (_compareTilesToWord(tilesUsed, targetWord2)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);

      targetWord2 = newTargetWord;
      winner2 = msg.sender;

      emit WordSubmitted(msg.sender, targetWord2);
    } else if (_compareTilesToWord(tilesUsed, targetWord3)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);

      targetWord3 = newTargetWord;
      winner3 = msg.sender;

      emit WordSubmitted(msg.sender, targetWord3);
    }
  }

  function addTargetWords(string memory _targetWord1, string memory _targetWord2, string memory _targetWord3) external onlyOwner{
    targetWord1 = _targetWord1;
    targetWord2 = _targetWord2;
    targetWord3 = _targetWord3;
  }

  function mintTile() external {
    require(players[msg.sender].tiles.length < 10, "Cannot have more than 10 tiles");
    require(players[msg.sender].posititon > 0, "Cannot mint this tile");

    uint8 newTile = players[msg.sender].posititon - 1;
    players[msg.sender].tiles.push(newTile);
    
    emit TileMinted(msg.sender, newTile);
  }

  function discardTile(uint8[] memory tileIDs) external {
    removeTilesFromPlayer(msg.sender, tileIDs);
    emit TileDiscard(msg.sender, tileIDs);
  }

  // Remove tiles from player's inventory
  function removeTilesFromPlayer(address player, uint8[] memory tilesUsed) internal {
    for (uint i = 0; i < tilesUsed.length; i++) {
      for (uint j = 0; j < players[player].tiles.length; j++) {
        if (players[player].tiles[j] == tilesUsed[i]) {
          // Remove tile by swapping with last element and popping
          players[player].tiles[j] = players[player].tiles[players[player].tiles.length - 1];
          players[player].tiles.pop();
          break;
        }
      }
    }
    players[player].tilesUsed += tilesUsed.length;
  }

  function getPlayerTiles(address player) external view returns (uint8[] memory) {
    return players[player].tiles;
  }

  function getRandomNumber() internal view returns (uint256) {
    uint256 randomIndex = uint256(keccak256(abi.encodePacked(
      block.timestamp,
      msg.sender,
      players[msg.sender].tiles.length
    ))) % 6;
    
    return randomIndex;
  }

  function _compareTilesToWord(uint8[] calldata tilesUsed, string memory targetWord) private pure returns (bool) {
    bytes memory wordBytes = bytes(targetWord);
    
    // Check if lengths match
    if (tilesUsed.length != wordBytes.length) {
      return false;
    }
    
    // Compare each tile (assuming tiles are ASCII character codes)
    for (uint i = 0; i < tilesUsed.length; i++) {
      if (tilesUsed[i] + 65 != uint8(wordBytes[i])) {
        return false;
      }
    }
    
    return true;
  }

  // Calculate word score based on tile values
  function calculateWordScore(uint8[] memory tilesUsed) internal view returns (uint256) {
    uint256 score = 0;
    for (uint i = 0; i < tilesUsed.length; i++) {
      score += tileScores[tilesUsed[i]];
    }
    return score;
  }
}
