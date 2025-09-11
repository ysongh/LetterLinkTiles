import React, { useState } from 'react';
import { Gamepad2, Trophy, Target, Shuffle, Send, Plus } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";

import TargetWords from "../artifacts/contracts/TargetWords.sol/TargetWords.json";

interface Player {
  isActive: boolean;
  tiles: number[];
  score: number;
  tilesUsed: number;
}

const TargetWordsGame: React.FC = () => {
  const { address } = useAccount();

  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);

  // Letter mappings
  const numberToLetter = (num: number): string => {
    return String.fromCharCode(64 + num); // A=1 -> 'A', B=2 -> 'B', etc.
  };

  const letterToNumber = (letter: string): number => {
    return letter.charCodeAt(0) - 64;
  };

  // Tile scores matching contract
  const tileScores: { [key: number]: number } = {
    1: 1, 2: 3, 3: 3, 4: 2, 5: 1, 6: 4, 7: 2, 8: 4, 9: 1, 10: 8,
    11: 5, 12: 1, 13: 3, 14: 1, 15: 1, 16: 3, 17: 10, 18: 1, 19: 1, 20: 1,
    21: 1, 22: 4, 23: 4, 24: 8, 25: 4, 26: 10
  };

  const { data: playerTiles = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'getPlayerTiles',
    args: [address]
  }) as { data: any };

  const { data: targetWord1 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'targetWord1',
  }) as { data: any };

  const { data: targetWord2 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'targetWord2',
  }) as { data: any };

  const { data: targetWord3 } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'targetWord3',
  }) as { data: any };

  const {
    writeContract,
    data: txHash,
    isPending
  } = useWriteContract();

  // Mock join game function
  const joinGame = async () => {
    writeContract({
      address: import.meta.env.VITE_GAME_CONTRACT,
      abi: TargetWords.abi,
      functionName: "joinGame",
    })
  };

  // Toggle tile selection
  const toggleTileSelection = (tileIndex: number) => {
    const tile = playerTiles[tileIndex];
    if (!tile) return;

    setSelectedTiles(prev => {
      const isSelected = prev.includes(tileIndex);
      if (isSelected) {
        return prev.filter(index => index !== tileIndex);
      } else {
        return [...prev, tileIndex];
      }
    });
  };

  const buyTile = async () => {
    try {
      writeContract({
        address: import.meta.env.VITE_GAME_CONTRACT,
        abi: TargetWords.abi,
        functionName: "buyTile",
        value: parseEther("0.001")
      })
    } catch (error) {
      console.log('Failed to buy tile');
    }
  };

  // Submit word
  const submitWord = async () => {
    if (selectedTiles.length === 0) return;

    const tilesUsed = selectedTiles.map(i => playerTiles[i]);
    console.log(tilesUsed);
    
    writeContract({
      address: import.meta.env.VITE_GAME_CONTRACT,
      abi: TargetWords.abi,
      functionName: "submitWord",
      args: [tilesUsed]
    })
  };

  console.log(playerTiles, targetWord1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 size={40} className="text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              TargetWords
            </h1>
          </div>
          <p className="text-lg text-gray-300">
            Use your letter tiles to create the target words and earn points!
          </p>
        </div>

        {playerTiles && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-2 space-y-6">
              {/* Target Words */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-red-400" />
                  <h2 className="text-xl font-semibold">Target Words</h2>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-900/30 border border-red-400 rounded-lg px-4 py-2 text-center">
                    <span className="text-lg font-mono">{targetWord1}</span>
                  </div>
                  <div className="bg-red-900/30 border border-red-400 rounded-lg px-4 py-2 text-center">
                    <span className="text-lg font-mono">{targetWord2}</span>
                  </div>
                  <div className="bg-red-900/30 border border-red-400 rounded-lg px-4 py-2 text-center">
                    <span className="text-lg font-mono">{targetWord3}</span>
                  </div>
                </div>
              </div>

              {/* Player Tiles */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Tiles</h2>
                  <button
                    onClick={buyTile}
                    className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                    title="Shuffle tiles"
                  >
                    <Shuffle size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {playerTiles.map((tile, index) => (
                    <button
                      key={index}
                      onClick={() => toggleTileSelection(index)}
                      className={`aspect-square rounded-lg border-2 text-xl font-bold transition-all transform hover:scale-105 ${
                        selectedTiles.includes(index)
                          ? 'bg-yellow-400 text-black border-yellow-300 scale-105'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{numberToLetter(tile)}</span>
                        <span className="text-xs opacity-70">{tileScores[tile]}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Word Display */}
                {selectedTiles.length && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {selectedTiles.map((s, index) => (
                          <span key={index} className="text-lg font-mono">{numberToLetter(playerTiles[s])}</span>
                        ))}
                       
                        <span className="ml-3 text-sm text-gray-400">
                          ({selectedTiles.reduce((sum, i) => 
                            sum + tileScores[playerTiles[i]], 0)} points)
                        </span>
                      </div>
                      <button
                        onClick={submitWord}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Send size={16} />
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Player Stats */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="text-yellow-400" />
                  <h2 className="text-xl font-semibold">Your Stats</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-yellow-400">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiles Used:</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiles Left:</span>
                    <span>0</span>
                  </div>
                </div>
              </div>

              {/* Game Log */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Game Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {!address && (
          <div className="text-center mt-12">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-8 max-w-md mx-auto">
              <Gamepad2 size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Play?</h3>
              <p className="text-gray-400 mb-4">
                Connect your wallet and join the game to start creating words with letter tiles!
              </p>
            </div>
          </div>
        )}

        {address && !playerTiles && (
          <div className="text-center mt-12">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-8 max-w-md mx-auto">
              <Plus size={64} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Join the Game</h3>
              <p className="text-gray-400 mb-4">
                Click "Join Game" to receive your starting tiles and begin playing!
              </p>
              <button
                onClick={joinGame}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Join Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetWordsGame;