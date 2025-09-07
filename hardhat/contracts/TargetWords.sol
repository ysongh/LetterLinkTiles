// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TargetWords {
  event PlayerJoined(address indexed player, uint8[] initialTiles);

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
  string public targetWord1;
  string public targetWord2;
  string public targetWord3;

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

  function addTargetWords(string memory _targetWord1, string memory _targetWord2, string memory _targetWord3) external onlyOwner{
    targetWord1 = _targetWord1;
    targetWord2 = _targetWord2;
    targetWord3 = _targetWord3;
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