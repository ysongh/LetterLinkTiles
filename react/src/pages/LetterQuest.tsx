import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Trophy, Users, Target, Trash2, Plus, Send } from 'lucide-react';
import { useAccount, useBlockNumber, useReadContract, useWriteContract } from "wagmi";

import LetterQuest from "../artifacts/contracts/LetterQuest.sol/LetterQuest.json";

interface Player {
  isActive: boolean;
  tiles: number[];
  score: number;
  tilesUsed: number;
  position: number;
}

interface GameEvent {
  type: 'join' | 'roll' | 'word' | 'mint' | 'discard';
  player: string;
  data?: any;
  timestamp: number;
}

const LetterQuestGame: React.FC = () => {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Game state
  const [isConnected, setIsConnected] = useState(false);
  const [playerAddress, setPlayerAddress] = useState('');
  const [player, setPlayer] = useState<Player>({
    isActive: false,
    tiles: [],
    score: 0,
    tilesUsed: 0,
    position: 0
  });
  
  const [targetWords, setTargetWords] = useState(['HELLO', 'WORLD', 'QUEST']);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  useEffect(() => {
    playerTilesRefetch();
  }, [blockNumber])

  const { data: playerTiles = [], refetch: playerTilesRefetch } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: LetterQuest.abi,
    functionName: 'getPlayerTiles',
    args: [address]
  }) as { data: any, refetch: () => void  };

  const { writeContract } = useWriteContract();

  // Convert position number to letter (A=1, B=2, etc.)
  const positionToLetter = (pos: number): string => {
    if (pos === 0) return 'START';
    return String.fromCharCode(64 + pos); // 65 is 'A'
  };

  // Convert tile number to letter for display
  const tileToLetter = (tile: number): string => {
    if (tile === 0) return '?';
    return String.fromCharCode(64 + tile);
  };

  // Get tile score based on Scrabble-like scoring
  const getTileScore = (tile: number): number => {
    const scores = [0, 1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];
    return scores[tile] || 0;
  };

  // Dice component based on number
  const DiceIcon = ({ number }: { number: number }) => {
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const IconComponent = diceIcons[number - 1] || Dice1;
    return <IconComponent className="w-8 h-8" />;
  };

  // Mock functions (replace with actual contract calls)
  const connectWallet = async () => {
    // Mock connection
    setIsConnected(true);
    setPlayerAddress('0x1234...5678');
  };

  const joinGame = async () => {
    setPlayer(prev => ({ ...prev, isActive: true }));
    addGameEvent('join', 'You joined the game!');
    writeContract({
      address: import.meta.env.VITE_GAME_CONTRACT,
      abi: LetterQuest.abi,
      functionName: "joinGame",
    })
  };

  const rollDice = async () => {
    writeContract({
      address: import.meta.env.VITE_GAME_CONTRACT,
      abi: LetterQuest.abi,
      functionName: "rollDice",
    });
  };

  const mintTile = async () => {
    if (player.tiles.length >= 10) {
      alert('Cannot have more than 10 tiles!');
      return;
    }
    
    const newTile = player.position || Math.floor(Math.random() * 26) + 1;
    setPlayer(prev => ({ 
      ...prev, 
      tiles: [...prev.tiles, newTile] 
    }));
    
    addGameEvent('mint', `Minted tile: ${tileToLetter(newTile)}`);
  };

  const discardTiles = async () => {
    if (selectedTiles.length === 0) return;
    
    setPlayer(prev => ({
      ...prev,
      tiles: prev.tiles.filter((_, index) => !selectedTiles.includes(index))
    }));
    
    addGameEvent('discard', `Discarded ${selectedTiles.length} tiles`);
    setSelectedTiles([]);
  };

  const submitWord = async () => {
    if (selectedTiles.length === 0) return;
    
    const selectedTileValues = selectedTiles.map(index => player.tiles[index]);
    const word = selectedTileValues.map(tile => tileToLetter(tile)).join('');
    
    // Check if word matches any target word
    const isValidWord = targetWords.some(target => target === word);
    
    if (isValidWord) {
      const score = selectedTileValues.reduce((sum, tile) => sum + getTileScore(tile), 0);
      setPlayer(prev => ({
        ...prev,
        score: prev.score + score,
        tiles: prev.tiles.filter((_, index) => !selectedTiles.includes(index)),
        tilesUsed: prev.tilesUsed + selectedTiles.length
      }));
      
      addGameEvent('word', `Submitted word "${word}" for ${score} points!`);
      setSelectedTiles([]);
    } else {
      alert(`"${word}" is not a valid target word!`);
    }
  };

  const addGameEvent = (type: GameEvent['type'], data: string) => {
    setGameEvents(prev => [...prev, {
      type,
      player: 'You',
      data,
      timestamp: Date.now()
    }].slice(-10)); // Keep last 10 events
  };

  const toggleTileSelection = (index: number) => {
    setSelectedTiles(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            LetterQuest
          </h1>
          <p className="text-xl text-gray-300">Collect letters, form words, earn points!</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? `Connected: ${playerAddress}` : 'Not Connected'}</span>
            </div>
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Game Board */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Board */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold">Game Board</h3>
                </div>
                
                {/* Circular Board */}
                <div className="relative w-80 h-80 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 bg-gradient-to-br from-purple-800/50 to-blue-800/50"></div>
                  
                  {/* Board positions */}
                  {Array.from({ length: 26 }, (_, i) => {
                    const angle = (i * 360) / 26 - 90; // Start from top
                    const radian = (angle * Math.PI) / 180;
                    const radius = 140; // Distance from center
                    const x = Math.cos(radian) * radius + 160; // Center offset
                    const y = Math.sin(radian) * radius + 160; // Center offset
                    const isPlayerPosition = player.position === i + 1;
                    const isStart = i === 25; // Position 0 maps to index 25
                    
                    return (
                      <div
                        key={i}
                        className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                          isStart
                            ? 'bg-green-500 border-green-300 text-white shadow-lg'
                            : isPlayerPosition
                            ? 'bg-yellow-400 border-yellow-300 text-black shadow-lg animate-pulse scale-125'
                            : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                        }`}
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                        }}
                      >
                        {i === 25 ? 'S' : String.fromCharCode(65 + i)}
                      </div>
                    );
                  })}
                  
                  {/* Center area with player info */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-black/30 rounded-full p-6 border border-white/20">
                      <div className="text-lg font-bold text-yellow-400">Score</div>
                      <div className="text-2xl font-bold">{player.score}</div>
                      <div className="text-xs text-gray-300 mt-1">
                        {player.isActive ? positionToLetter(player.position) : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Last roll indicator */}
                  {lastRoll && player.isActive && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold border-2 border-blue-300 animate-bounce">
                      {lastRoll}
                    </div>
                  )}
                </div>

                {/* Player Stats Row */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-400">{player.tiles.length}</div>
                    <div className="text-sm text-gray-300">Tiles</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">{player.tilesUsed}</div>
                    <div className="text-sm text-gray-300">Used</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-400">{player.tiles.length}/10</div>
                    <div className="text-sm text-gray-300">Capacity</div>
                  </div>
                </div>
              </div>

              {/* Game Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Game Actions</h3>
                <div className="flex flex-wrap gap-4">
                  {!player.isActive && (
                    <button
                      onClick={joinGame}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Join Game
                    </button>
                  )}
                  
                  {player.isActive && (
                    <>
                      <button
                        onClick={rollDice}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        {lastRoll ? <DiceIcon number={lastRoll} /> : <Dice1 className="w-4 h-4" />}
                        Roll Dice
                      </button>
                      
                      <button
                        onClick={mintTile}
                        disabled={player.tiles.length >= 10}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Mint Tile
                      </button>
                      
                      <button
                        onClick={discardTiles}
                        disabled={selectedTiles.length === 0}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Discard Selected
                      </button>
                      
                      <button
                        onClick={submitWord}
                        disabled={selectedTiles.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Submit Word
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Player Tiles */}
              {playerTiles && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Your Tiles</h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                    {playerTiles.map((tile, index) => (
                      <button
                        key={index}
                        onClick={() => toggleTileSelection(index)}
                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-105 ${
                          selectedTiles.includes(index)
                            ? 'bg-yellow-400 border-yellow-300 text-black'
                            : 'bg-white/20 border-white/30 hover:bg-white/30'
                        }`}
                      >
                        <div>{tileToLetter(tile)}</div>
                        <div className="text-xs">{getTileScore(tile)}</div>
                      </button>
                    ))}
                  </div>
                  {selectedTiles.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-400/20 rounded-lg">
                      <div className="font-bold">
                        Selected Word: {selectedTiles.map(i => tileToLetter(player.tiles[i])).join('')}
                      </div>
                      <div className="text-sm text-gray-300">
                        Score: {selectedTiles.reduce((sum, i) => sum + getTileScore(player.tiles[i]), 0)} points
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Game Info */}
            <div className="space-y-6">
              {/* Target Words */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold">Target Words</h3>
                </div>
                <div className="space-y-2">
                  {targetWords.map((word, index) => (
                    <div key={index} className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
                      {word}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Events */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Events</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameEvents.length === 0 ? (
                    <p className="text-gray-400 text-sm">No events yet...</p>
                  ) : (
                    gameEvents.slice().reverse().map((event, index) => (
                      <div key={index} className="text-sm p-2 bg-white/10 rounded">
                        <div className="font-medium text-blue-300">{event.player}</div>
                        <div className="text-gray-300">{event.data}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Rules */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">How to Play</h3>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li>• Join the game to start playing</li>
                  <li>• Roll dice to move around the board</li>
                  <li>• Mint tiles at your current position</li>
                  <li>• Collect letters to form target words</li>
                  <li>• Submit words to earn points</li>
                  <li>• Discard unwanted tiles</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterQuestGame;
