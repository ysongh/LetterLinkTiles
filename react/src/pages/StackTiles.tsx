import React, { useState, useEffect, useCallback } from 'react';
import { Coins, Target, Trophy, User, Zap, Plus, Send } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import StackTiles from "../artifacts/contracts/StackTiles.sol/StackTiles.json";

// Types
interface Player {
  isActive: boolean;
  tiles: number[];
  score: number;
  tilesUsed: number;
}

interface GameState {
  targetLetter1: number;
  targetLetter2: number;
  targetLetter3: number;
  playerData: Player;
  isConnected: boolean;
  address: string;
  tileCost: number;
}

// Convert number to letter (1=A, 2=B, etc.)
const numberToLetter = (num: number): string => {
  return String.fromCharCode(64 + num);
};

// Get tile rarity color
const getTileRarity = (tileNum: number): string => {
  // Based on Scrabble distribution in the contract
  const rareTiles = [10, 11, 17, 24, 26]; // J, K, Q, X, Z
  const uncommonTiles = [6, 8, 13, 16, 22, 23, 25]; // F, H, M, P, V, W, Y
  
  if (rareTiles.includes(tileNum)) {
    return 'from-yellow-400 to-orange-500 shadow-yellow-300/50';
  } else if (uncommonTiles.includes(tileNum)) {
    return 'from-purple-400 to-blue-500 shadow-purple-300/50';
  } else {
    return 'from-green-400 to-teal-500 shadow-green-300/50';
  }
};

const StackTilesGame: React.FC = () => {
  const { address } = useAccount();

  const [gameState, setGameState] = useState<GameState>({
    targetLetter1: 1,
    targetLetter2: 5,
    targetLetter3: 9,
    playerData: {
      isActive: false,
      tiles: [],
      score: 0,
      tilesUsed: 0
    },
    isConnected: false,
    address: '',
    tileCost: 0.001
  });

  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const { data: playerTiles = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: StackTiles.abi,
    functionName: 'getPlayerTiles',
    args: [address]
  }) as { data: any };

  const { data: targetLetter1 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: StackTiles.abi,
    functionName: 'targetLetter1',
  }) as { data: BigInt };

  const { data: targetLetter2 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: StackTiles.abi,
    functionName: 'targetLetter2',
  }) as { data: BigInt };

  const { data: targetLetter3 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: StackTiles.abi,
    functionName: 'targetLetter3',
  }) as { data: BigInt };

  const { writeContract } = useWriteContract();

  // Mock Web3 connection
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGameState(prev => ({
        ...prev,
        isConnected: true,
        address: '0x' + Math.random().toString(16).substr(2, 40)
      }));
      setMessage('Wallet connected successfully!');
    } catch (error) {
      setMessage('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinGame = useCallback(async () => {
    if (!gameState.isConnected) return;
    
    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: StackTiles.abi,
        functionName: "joinGame",
      })
      
      // Generate 5 random tiles
      const initialTiles = Array.from({ length: 5 }, () => 
        Math.floor(Math.random() * 26) + 1
      );
      
      setGameState(prev => ({
        ...prev,
        playerData: {
          isActive: true,
          tiles: initialTiles,
          score: 0,
          tilesUsed: 0
        }
      }));
      setMessage('Joined game! You received 5 tiles.');
    } catch (error) {
      setMessage('Failed to join game');
    } finally {
      setIsLoading(false);
    }
  }, [gameState.isConnected]);

  const buyTile = async () => {
    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: StackTiles.abi,
        functionName: "buyTile",
        value: parseEther("0.001")
      })
      setMessage(`Purchased tile`);
    } catch (error) {
      setMessage('Failed to buy tile');
    } finally {
      setIsLoading(false);
    }
  };

  const submitTile = async () => {
    setIsLoading(true);
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: StackTiles.abi,
        functionName: "submitTile",
        args: [selectedTile]
      })
      setSelectedTile(null);
    } catch (error) {
      setMessage('Failed to submit tile');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            StackTiles
          </h1>
          <p className="text-xl text-gray-300">Match your tiles with the targets to score points!</p>
        </div>

        {/* Status Message */}
        {message && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl mb-6 text-center shadow-lg">
            {message}
          </div>
        )}

        {/* Wallet Connection */}
        {!gameState.isConnected ? (
          <div className="text-center mb-8">
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Player Info & Actions */}
            <div className="space-y-6">
              {/* Player Status */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Player Status</h2>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="font-mono text-sm">{gameState.address.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-yellow-400">{gameState.playerData.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiles Used:</span>
                    <span>{gameState.playerData.tilesUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active:</span>
                    <span className={gameState.playerData.isActive ? 'text-green-400' : 'text-red-400'}>
                      {gameState.playerData.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Actions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  {!gameState.playerData.isActive ? (
                    <button
                      onClick={joinGame}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Joining...' : 'Join Game'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={buyTile}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isLoading ? 'Buying...' : `Buy Tile (${gameState.tileCost} ETH)`}</span>
                      </button>
                      
                      {selectedTile !== null && (
                        <button
                          onClick={() => submitTile(selectedTile)}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isLoading ? 'Submitting...' : `Submit ${numberToLetter(selectedTile)}`}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center Panel - Target Letters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Target Letters</h2>
              </div>
              
              <div className="space-y-4">
                {[targetLetter1, targetLetter2, targetLetter3].map((target, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 w-24 h-24 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-white/30">
                      <span className="text-4xl font-bold text-white">{numberToLetter(Number(target))}</span>
                    </div>
                    <p className="text-gray-300 mt-2">Target {index + 1}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-300 text-center">
                  Match any of your tiles with these target letters to score points!
                </p>
              </div>
            </div>

            {/* Right Panel - Player Tiles */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <Coins className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Your Tiles</h2>
                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold">
                  {playerTiles.length}
                </span>
              </div>

              {playerTiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No tiles yet. Join the game to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {playerTiles.map((tile, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTile(tile)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 transition-all hover:scale-105 ${
                        selectedTile === tile 
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-500 to-orange-600' 
                          : `border-white/30 bg-gradient-to-br ${getTileRarity(tile)}`
                      }`}
                    >
                      {numberToLetter(tile)}
                    </button>
                  ))}
                </div>
              )}

              {selectedTile !== null && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
                  <p className="text-yellow-200 text-sm text-center">
                    Selected: <span className="font-bold">{numberToLetter(selectedTile)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Rules */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Connect your wallet and join the game to receive 5 random letter tiles.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Target className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span>Match your tiles with the three target letters to score points.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span>Buy more tiles for 0.001 ETH to increase your chances of matching!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackTilesGame;
