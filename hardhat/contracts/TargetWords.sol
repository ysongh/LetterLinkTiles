// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TargetWords {
  event PlayerJoined(address indexed player, uint8[] initialTiles);
  event WordSubmitted(address indexed player, string word);
  event TilePurchased(address indexed player, uint8 tile);

  // Tile distribution (A=1, B=2, ..., Z=26)
  // Based on standard Scrabble distribution
  uint8[] private tilePool = [
    1,1,1,1,1,1,1,1,1, // A (9 tiles)
    2,2, // B (2 tiles)
    3,3, // C (2 tiles)
    4,4,4,4, // D (4 tiles)
    5,5,5,5,5,5,5,5,5,5,5,5, // E (12 tiles)
    6,6, // F (2 tiles)
    7,7,7, // G (3 tiles)
    8,8, // H (2 tiles)
    9,9,9,9,9,9,9,9,9, // I (9 tiles)
    10, // J (1 tile)
    11, // K (1 tile)
    12,12,12,12, // L (4 tiles)
    13,13, // M (2 tiles)
    14,14,14,14,14,14, // N (6 tiles)
    15,15,15,15,15,15,15,15, // O (8 tiles)
    16,16, // P (2 tiles)
    17, // Q (1 tile)
    18,18,18,18,18,18, // R (6 tiles)
    19,19,19,19, // S (4 tiles)
    20,20,20,20,20,20, // T (6 tiles)
    21,21,21,21, // U (4 tiles)
    22,22, // V (2 tiles)
    23,23, // W (2 tiles)
    24, // X (1 tile)
    25,25, // Y (2 tiles)
    26 // Z (1 tile)
  ];

  // Tile scores (A=1, B=3, C=3, D=2, E=1, F=4, G=2, H=4, I=1, J=8, K=5, L=1, M=3, N=1, O=1, P=3, Q=10, R=1, S=1, T=1, U=1, V=4, W=4, X=8, Y=4, Z=10)
  uint8[27] private tileScores = [0, 1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];

  // Structs
  struct Player {
    bool isActive;
    uint8[] tiles; // Array of tile IDs (A=1, B=2, ..., Z=26)
    uint256 score;
    uint256 tilesUsed;
  }
  mapping(address => Player) public players;
  address[] public activePlayers;
  address public owner;
  string public targetWord1;
  string public targetWord2;
  string public targetWord3;
  uint256 public tileCost = 0.001 ether;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  // Join the game and receive 7 random tiles
  function joinGame() external {
    require(!players[msg.sender].isActive, "Player already active");
    
    players[msg.sender].isActive = true;
    players[msg.sender].score = 0;
    players[msg.sender].tilesUsed = 0;
    
    // Give 7 random tiles
    uint8[] memory initialTiles = new uint8[](7);
    for (uint i = 0; i < 7; i++) {
      initialTiles[i] = getRandomTile();
      players[msg.sender].tiles.push(initialTiles[i]);
    }
    
    activePlayers.push(msg.sender);
    emit PlayerJoined(msg.sender, initialTiles);
  }

  function submitWord(uint8[] calldata tilesUsed) external {
    if (_compareTilesToWord(tilesUsed, targetWord1)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);
      emit WordSubmitted(msg.sender, targetWord1);
    } else if (_compareTilesToWord(tilesUsed, targetWord2)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);
      emit WordSubmitted(msg.sender, targetWord2);
    } else if (_compareTilesToWord(tilesUsed, targetWord3)) {
      uint256 wordScore = calculateWordScore(tilesUsed);
      players[msg.sender].score += wordScore;
      removeTilesFromPlayer(msg.sender, tilesUsed);
      emit WordSubmitted(msg.sender, targetWord3);
    }
  }

  function addTargetWords(string memory _targetWord1, string memory _targetWord2, string memory _targetWord3) external onlyOwner{
    targetWord1 = _targetWord1;
    targetWord2 = _targetWord2;
    targetWord3 = _targetWord3;
  }

  function buyTile() external payable {
    require(msg.value >= tileCost, "Insufficient payment for tile");
    
    uint8 newTile = getRandomTile();
    players[msg.sender].tiles.push(newTile);
    
    // Refund excess payment
    if (msg.value > tileCost) {
        payable(msg.sender).transfer(msg.value - tileCost);
    }
    
    emit TilePurchased(msg.sender, newTile);
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

  function _compareTilesToWord(uint8[] calldata tilesUsed, string memory targetWord) private pure returns (bool) {
    bytes memory wordBytes = bytes(targetWord);
    
    // Check if lengths match
    if (tilesUsed.length != wordBytes.length) {
      return false;
    }
    
    // Compare each tile (assuming tiles are ASCII character codes)
    for (uint i = 0; i < tilesUsed.length; i++) {
      if (tilesUsed[i] != uint8(wordBytes[i])) {
        return false;
      }
    }
    
    return true;
  }

  // Internal function to get a random tile
  function getRandomTile() internal view returns (uint8) {
    uint256 randomIndex = uint256(keccak256(abi.encodePacked(
      block.timestamp,
      msg.sender,
      players[msg.sender].tiles.length
    ))) % tilePool.length;
    
    return tilePool[randomIndex];
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