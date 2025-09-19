// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StackTiles {
  event PlayerJoined(address indexed player, uint8[] initialTiles);
  event WordSubmitted(address indexed player, uint8 tile);
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
  uint8 public targetLetter1;
  uint8 public targetLetter2;
  uint8 public targetLetter3;
  uint256 public tileCost = 0.001 ether;
  address currentStreakPlayer;
  uint256 currentStreakCount;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  constructor() {
    owner = msg.sender;
    targetLetter1 = 1;
    targetLetter2 = 2;
    targetLetter3 = 3;
  }

  // Join the game and receive 5 random tiles
  function joinGame() external {
    require(!players[msg.sender].isActive, "Player already active");
    
    players[msg.sender].isActive = true;
    players[msg.sender].score = 0;
    players[msg.sender].tilesUsed = 0;
    
    // Give 7 random tiles
    uint8[] memory initialTiles = new uint8[](5);
    for (uint i = 0; i < 5; i++) {
      initialTiles[i] = getRandomTile();
      players[msg.sender].tiles.push(initialTiles[i]);
    }
    
    activePlayers.push(msg.sender);
    emit PlayerJoined(msg.sender, initialTiles);
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

  function submitTile(uint8 tileUsed) external {
    if (tileUsed == targetLetter1) {
      players[msg.sender].score += calculatScore(msg.sender);
      targetLetter1 = getRandomTile();
      removeTilesFromPlayer(msg.sender, tileUsed);
    } else if (tileUsed == targetLetter2) {
      uint256 wordScore = calculatScore(msg.sender);
      players[msg.sender].score += wordScore;
      targetLetter2 = getRandomTile();
      removeTilesFromPlayer(msg.sender, tileUsed);
    } else if (tileUsed == targetLetter3) {
      uint256 wordScore = calculatScore(msg.sender);
      players[msg.sender].score += wordScore;
      targetLetter3 = getRandomTile();
      removeTilesFromPlayer(msg.sender, tileUsed);
    }
    
    emit WordSubmitted(msg.sender, tileUsed);
  }

  // Remove tile from player's inventory
  function removeTilesFromPlayer(address player, uint8 tileUsed) internal {
    for (uint j = 0; j < players[player].tiles.length; j++) {
      if (players[player].tiles[j] == tileUsed) {
        // Remove tile by swapping with last element and popping
        players[player].tiles[j] = players[player].tiles[players[player].tiles.length - 1];
        players[player].tiles.pop();
        break;
      }
    }
    players[player].tilesUsed += 1;
  }

  function getPlayerTiles(address player) external view returns (uint8[] memory) {
    return players[player].tiles;
  }

  function calculatScore(address player) internal returns (uint256) {
    if (player == currentStreakPlayer) {
      currentStreakCount++;
      return currentStreakCount;
    }
    else {
      currentStreakPlayer = player;
      currentStreakCount = 0;
      return 1;
    }
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
}
