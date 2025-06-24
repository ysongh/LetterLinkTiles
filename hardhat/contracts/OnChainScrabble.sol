// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OnChainScrabble {
    // Address of the Cadence Arch contract
    address constant public cadenceArch = 0x0000000000000000000000010000000000000001;

    // Events
    event PlayerJoined(address indexed player, uint8[] initialTiles);
    event TilePurchased(address indexed player, uint8 tile);
    event WordSubmitted(address indexed player, string word, uint256 score, bool verified);
    event AIAgentUpdated(address indexed newAgent);
    
    // Structs
    struct Player {
        bool isActive;
        uint8[] tiles; // Array of tile IDs (A=1, B=2, ..., Z=26)
        uint256 score;
        uint256 tilesUsed;
    }
    
    struct WordSubmission {
        address player;
        string word;
        uint8[] tilesUsed;
        uint256 timestamp;
        bool verified;
        uint256 score;
    }
    
    // State variables
    mapping(address => Player) public players;
    mapping(uint256 => WordSubmission) public wordSubmissions;
    address[] public activePlayers;
    uint256 public wordSubmissionCounter;
    
    address public aiAgent;
    address public owner;
    uint256 public tileCost = 0.001 ether; // Cost to buy a random tile
    
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
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI agent can call this function");
        _;
    }
    
    modifier onlyActivePlayer() {
        require(players[msg.sender].isActive, "Player is not active");
        _;
    }
    
    constructor(address _aiAgent) {
        owner = msg.sender;
        aiAgent = _aiAgent;
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
    
    // Buy a random tile
    function buyTile() external payable onlyActivePlayer {
        require(msg.value >= tileCost, "Insufficient payment for tile");
        
        uint8 newTile = getRandomTile();
        players[msg.sender].tiles.push(newTile);
        
        // Refund excess payment
        if (msg.value > tileCost) {
            payable(msg.sender).transfer(msg.value - tileCost);
        }
        
        emit TilePurchased(msg.sender, newTile);
    }
    
    // Submit a word for verification
    function submitWord(string calldata word, uint8[] calldata tilesUsed) external onlyActivePlayer {
        require(bytes(word).length > 0, "Word cannot be empty");
        require(tilesUsed.length == bytes(word).length, "Tiles count must match word length");
        require(hasRequiredTiles(msg.sender, tilesUsed), "Player doesn't have required tiles");
        
        // Store word submission
        wordSubmissions[wordSubmissionCounter] = WordSubmission({
            player: msg.sender,
            word: word,
            tilesUsed: tilesUsed,
            timestamp: block.timestamp,
            verified: false,
            score: 0
        });
        
        wordSubmissionCounter++;
        
        emit WordSubmitted(msg.sender, word, 0, false);
    }
    
    // AI agent verifies and scores a word
    function verifyAndScoreWord(uint256 submissionId, bool isValid) external onlyAIAgent {
        require(submissionId < wordSubmissionCounter, "Invalid submission ID");
        WordSubmission storage submission = wordSubmissions[submissionId];
        require(!submission.verified, "Word already verified");
        
        submission.verified = true;
        
        if (isValid) {
            uint256 wordScore = calculateWordScore(submission.tilesUsed);
            submission.score = wordScore;
            players[submission.player].score += wordScore;
            
            // Remove used tiles from player's inventory
            removeTilesFromPlayer(submission.player, submission.tilesUsed);
        }
        
        emit WordSubmitted(submission.player, submission.word, submission.score, isValid);
    }
    
    // Internal function to get a random tile
    function getRandomTile() internal view returns (uint8) {
        uint64 newRandom = revertibleRandom();
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            newRandom,
            msg.sender,
            players[msg.sender].tiles.length
        ))) % tilePool.length;
        
        return tilePool[randomIndex];
    }

    // Function to fetch a pseudo-random value
    function revertibleRandom() internal view returns (uint64) {
        // Static call to the Cadence Arch contract's revertibleRandom function
        (bool ok, bytes memory data) = cadenceArch.staticcall(abi.encodeWithSignature("revertibleRandom()"));
        require(ok, "Failed to fetch a random number through Cadence Arch");
        uint64 output = abi.decode(data, (uint64));
        // Return the random value
        return output;
    }
    
    // Check if player has required tiles
    function hasRequiredTiles(address player, uint8[] calldata tilesUsed) internal view returns (bool) {
        uint8[] memory playerTiles = players[player].tiles;
        
        // Count available tiles for each letter (1-26)
        uint8[27] memory availableCounts;
        for (uint i = 0; i < playerTiles.length; i++) {
            availableCounts[playerTiles[i]]++;
        }
        
        // Count required tiles for each letter
        uint8[27] memory requiredCounts;
        for (uint i = 0; i < tilesUsed.length; i++) {
            requiredCounts[tilesUsed[i]]++;
        }
        
        // Check if we have enough of each required tile
        for (uint8 tileId = 1; tileId <= 26; tileId++) {
            if (requiredCounts[tileId] > availableCounts[tileId]) {
                return false;
            }
        }
        
        return true;
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
    
    // Calculate word score based on tile values
    function calculateWordScore(uint8[] memory tilesUsed) internal view returns (uint256) {
        uint256 score = 0;
        for (uint i = 0; i < tilesUsed.length; i++) {
            score += tileScores[tilesUsed[i]];
        }
        return score;
    }
    
    // View functions
    function getPlayerTiles(address player) external view returns (uint8[] memory) {
        return players[player].tiles;
    }
    
    function getPlayerScore(address player) external view returns (uint256) {
        return players[player].score;
    }
    
    function getActivePlayersCount() external view returns (uint256) {
        return activePlayers.length;
    }
    
    function getWordSubmission(uint256 submissionId) external view returns (
        address player,
        string memory word,
        uint8[] memory tilesUsed,
        uint256 timestamp,
        bool verified,
        uint256 score
    ) {
        WordSubmission memory submission = wordSubmissions[submissionId];
        return (
            submission.player,
            submission.word,
            submission.tilesUsed,
            submission.timestamp,
            submission.verified,
            submission.score
        );
    }
    
    // Admin functions
    function setAIAgent(address _newAgent) external onlyOwner {
        aiAgent = _newAgent;
        emit AIAgentUpdated(_newAgent);
    }
    
    function setTileCost(uint256 _newCost) external onlyOwner {
        tileCost = _newCost;
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Convert tile ID to letter for display
    function tileToLetter(uint8 tileId) external pure returns (string memory) {
        require(tileId >= 1 && tileId <= 26, "Invalid tile ID");
        bytes memory alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return string(abi.encodePacked(alphabet[tileId - 1]));
    }
    
    // Convert letter to tile ID
    function letterToTile(string calldata letter) external pure returns (uint8) {
        bytes memory letterBytes = bytes(letter);
        require(letterBytes.length == 1, "Only single letters allowed");
        
        uint8 charCode = uint8(letterBytes[0]);
        if (charCode >= 65 && charCode <= 90) { // A-Z
            return charCode - 64;
        } else if (charCode >= 97 && charCode <= 122) { // a-z
            return charCode - 96;
        }
        
        revert("Invalid letter");
    }
}
