import { useState, useEffect } from 'react';
import { Trophy, Plus, Send, RefreshCw } from 'lucide-react';
import { useAccount, useBlockNumber, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import OnChainScrabble from "../artifacts/contracts/OnChainScrabble.sol/OnChainScrabble.json"
import SubmissionCard from '../components/SubmissionCard';

// Types
interface Player {
  address: string;
  isActive: boolean;
  tiles: number[];
  score: number;
  tilesUsed: number;
}

interface WordSubmission {
  id: number;
  player: string;
  word: string;
  tilesUsed: number[];
  timestamp: number;
  verified: boolean;
  score: number;
}

interface GameState {
  isConnected: boolean;
  address: string | null;
  player: Player | null;
  submissions: WordSubmission[];
  activePlayers: number;
  tileCost: string;
}

export default function Game() {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })
  
  const [gameState] = useState<GameState>({
    isConnected: false,
    address: null,
    player: null,
    submissions: [],
    activePlayers: 0,
    tileCost: '0.001'
  });

  const [wordInput, setWordInput] = useState('');
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    playerTilesRefetch();
  }, [blockNumber])

  // Tile values and letters
  const tileScores: { [key: number]: number } = {
    1: 1, 2: 3, 3: 3, 4: 2, 5: 1, 6: 4, 7: 2, 8: 4, 9: 1, 10: 8,
    11: 5, 12: 1, 13: 3, 14: 1, 15: 1, 16: 3, 17: 10, 18: 1, 19: 1, 20: 1,
    21: 1, 22: 4, 23: 4, 24: 8, 25: 4, 26: 10
  };

  const tileToLetter = (tileId: number): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[tileId - 1] || '?';
  };

  const { data: playerTiles = [], refetch: playerTilesRefetch  } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: OnChainScrabble.abi,
    functionName: 'getPlayerTiles',
    args: [address]
  }) as { data: any, refetch: () => void  };

  const { data: wordSubmissionCounter = 0 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: OnChainScrabble.abi,
    functionName: 'wordSubmissionCounter'
  }) as { data: number  };

  const { data: activePlayers = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: OnChainScrabble.abi,
    functionName: 'activePlayers',
  }) as { data: any  };

  const {
    writeContract
  } = useWriteContract();

  const joinGame = async () => {
    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: OnChainScrabble.abi,
        functionName: "joinGame",
      })
      
      showNotification('Successfully joined the game! You received 7 tiles.');
    } catch (error) {
      showNotification('Failed to join game');
    }
    setIsLoading(false);
  };

  const buyTile = async () => {
    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: OnChainScrabble.abi,
        functionName: "buyTile",
        value: parseEther("0.001")
      })
      showNotification(`Bought tile`);
    } catch (error) {
      showNotification('Failed to buy tile');
    }
    setIsLoading(false);
  };

  const submitWord = async () => {
    if (!wordInput.trim() || selectedTiles.length === 0) {
      showNotification('Please enter a word and select tiles');
      return;
    }
   
    const newInput = [];

    for(let i = 0; i < selectedTiles.length; i++) {
      newInput.push(playerTiles[selectedTiles[i]]);
    }

    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: OnChainScrabble.abi,
        functionName: "submitWord",
        args: [wordInput.trim(), newInput]
      })

      setWordInput('');
      setSelectedTiles([]);
      showNotification('Word submitted for verification!');
    } catch (error) {
      showNotification('Failed to submit word');
    }
    setIsLoading(false);
  };

  const toggleTileSelection = (tileIndex: number) => {
    const tile = playerTiles[tileIndex];
    if (!tile) return;

    console.log(tileIndex);

    setSelectedTiles(prev => {
      const isSelected = prev.includes(tileIndex);
      if (isSelected) {
        return prev.filter(index => index !== tileIndex);
      } else {
        return [...prev, tileIndex];
      }
    });
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const calculateWordScore = (tiles: number[]): number => {
    return tiles.reduce((sum, tileId) => sum + (tileScores[tileId] || 0), 0);
  };

  console.log(wordSubmissionCounter, notification)

  return (
    <div className="container mx-auto">
      {/* Join Game Screen */}
      {playerTiles.length === 0 ? <div className="text-center py-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-gray-300 mb-8">
            Join the game and receive 7 random letter tiles to get started!
          </p>
          <button
            onClick={joinGame}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Joining Game...' : 'Join Game'}
          </button>
        </div>
      </div>
      : <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-3">
        {/* Game Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Game</h2>
              <div className="flex items-center gap-2 text-xl font-bold">
                <Trophy className="w-6 h-6 text-yellow-400" />
                {0} points
              </div>
            </div>
            
            {/* Your Tiles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Your Tiles ({playerTiles.length})</h3>
              <div className="flex flex-wrap gap-2">
                {playerTiles?.map((tile: number, index: number) => (
                  <button
                    key={index}
                    onClick={() => toggleTileSelection(index)}
                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                      selectedTiles.includes(index)
                        ? 'bg-yellow-500 text-black transform scale-110'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {tileToLetter(tile)}
                    <div className="text-xs">{tileScores[tile]}</div>
                  </button>
                ))}
                <button
                  onClick={buyTile}
                  disabled={isLoading}
                  className="w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all disabled:opacity-50"
                  title={`Buy tile for ${gameState.tileCost} ETH`}
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Word Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Create Word</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                    placeholder="Enter your word..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={submitWord}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit
                  </button>
                </div>
              </div>
              
              {selectedTiles.length > 0 && (
                <div className="text-sm text-gray-300">
                  Selected tiles: {selectedTiles.map(index => tileToLetter(playerTiles[index])).join(', ')} 
                  (Score: {calculateWordScore(selectedTiles.map(index => playerTiles[index]))})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Word Submissions */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Recent Submissions</h3>
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {wordSubmissionCounter === 0 ? (
                <p className="text-gray-400 text-center py-8">No submissions yet</p>
              ) : (
                <div>
                  <SubmissionCard id={Number(wordSubmissionCounter) - 1} />
                  {wordSubmissionCounter > 1 && <SubmissionCard id={Number(wordSubmissionCounter) - 2} />}
                  {wordSubmissionCounter > 2 && <SubmissionCard id={Number(wordSubmissionCounter) - 3} />}
                </div>
              )}
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Game Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Players</span>
                <span className="font-bold">{activePlayers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Score</span>
                <span className="font-bold">{gameState.player?.score || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiles Used</span>
                <span className="font-bold">{gameState.player?.tilesUsed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tile Cost</span>
                <span className="font-bold">{gameState.tileCost} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}